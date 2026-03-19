const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');

const router = express.Router();

/**
 * Helper: get user's household_id from membership table
 */
async function getUserHouseholdId(userId) {
    const { data } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .single();
    return data?.household_id || null;
}

// ─────────────────────────────────────────────
// Helper: re-calculate and persist total_estimated_cost on a list
// ─────────────────────────────────────────────
async function syncListCost(listId) {
    const { data: items } = await supabase
        .from('grocery_list_items')
        .select('estimated_price')
        .eq('list_id', listId);

    const total = (items || []).reduce((sum, i) => sum + (parseFloat(i.estimated_price) || 0), 0);

    await supabase
        .from('grocery_lists')
        .update({ total_estimated_cost: parseFloat(total.toFixed(2)), updated_at: new Date().toISOString() })
        .eq('id', listId);
}

// ─────────────────────────────────────────────
// GET /api/groceries  — all lists with items for the user
// ─────────────────────────────────────────────
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { scope } = req.query;

        // Step 1: fetch all non-archived lists
        let query = supabase
            .from('grocery_lists')
            .select('*')
            .neq('status', 'archived')
            .order('created_at', { ascending: false });

        if (scope === 'household') {
            const householdId = await getUserHouseholdId(userId);
            if (!householdId) {
                return res.json({ lists: [] });
            }
            query = query.eq('household_id', householdId);
        } else {
            query = query.eq('user_id', userId).is('household_id', null);
        }

        const { data: lists, error: listsError } = await query;

        if (listsError) throw listsError;

        if (!lists || lists.length === 0) {
            return res.json({ lists: [] });
        }

        // Step 2: fetch all items for those lists in one query
        const listIds = lists.map(l => l.id);
        const { data: allItems, error: itemsError } = await supabase
            .from('grocery_list_items')
            .select('*')
            .in('list_id', listIds)
            .order('created_at', { ascending: true });

        if (itemsError) throw itemsError;

        // Step 3: zip items onto their parent lists
        const itemsByList = {};
        (allItems || []).forEach(item => {
            if (!itemsByList[item.list_id]) itemsByList[item.list_id] = [];
            itemsByList[item.list_id].push(item);
        });

        const shaped = lists.map(list => ({
            id: list.id,
            name: list.name,
            status: list.status,
            totalEstimatedCost: list.total_estimated_cost,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
            items: (itemsByList[list.id] || []).map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                isChecked: item.is_checked,
                estimatedPrice: item.estimated_price,
                notes: item.notes
            }))
        }));

        res.json({ lists: shaped });
    } catch (error) {
        console.error('Error fetching grocery lists:', error);
        res.status(500).json({ error: 'Failed to fetch grocery lists', details: error.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/groceries  — create a new list (with optional inline items)
// ─────────────────────────────────────────────
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, items, householdId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'List name is required' });
        }

        let validatedHouseholdId = null;
        if (householdId) {
            const userHouseholdId = await getUserHouseholdId(userId);
            if (userHouseholdId !== householdId) {
                return res.status(403).json({ error: 'Not a member of this household' });
            }
            validatedHouseholdId = householdId;
        }

        // Create the list
        const { data: list, error: listError } = await supabase
            .from('grocery_lists')
            .insert({
                user_id: userId,
                name: name.trim(),
                status: 'active',
                household_id: validatedHouseholdId
            })
            .select()
            .single();

        if (listError) throw listError;

        // Insert items if provided
        let insertedItems = [];
        if (items && items.length > 0) {
            const itemRows = items.map(item => ({
                list_id: list.id,
                name: item.name,
                quantity: parseFloat(item.quantity) || 1,
                unit: item.unit || 'pieces',
                category: item.category || 'General',
                estimated_price: item.estimatedPrice ? parseFloat(item.estimatedPrice) : null,
                notes: item.notes || null,
                barcode: item.barcode || null,
                is_checked: false
            }));

            const { data: createdItems, error: itemsError } = await supabase
                .from('grocery_list_items')
                .insert(itemRows)
                .select();

            if (itemsError) throw itemsError;
            insertedItems = createdItems || [];

            // Keep the denormalised cost in sync
            await syncListCost(list.id);
        }

        const totalCost = insertedItems.reduce((sum, i) => sum + (parseFloat(i.estimated_price) || 0), 0);

        res.status(201).json({
            success: true,
            message: 'Grocery list created successfully',
            list: {
                id: list.id,
                name: list.name,
                status: list.status,
                totalEstimatedCost: parseFloat(totalCost.toFixed(2)),
                createdAt: list.created_at,
                updatedAt: list.updated_at,
                items: insertedItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category,
                    isChecked: item.is_checked,
                    estimatedPrice: item.estimated_price,
                    notes: item.notes
                }))
            }
        });
    } catch (error) {
        console.error('Error creating grocery list:', error);
        res.status(500).json({ error: 'Failed to create grocery list', details: error.message });
    }
});

// ─────────────────────────────────────────────
// PUT /api/groceries/:id  — update list metadata (name / status)
// ─────────────────────────────────────────────
router.put('/:id', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, status } = req.body;

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('grocery_lists')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        const updates = { updated_at: new Date().toISOString() };
        if (name !== undefined) updates.name = name.trim();
        if (status !== undefined) updates.status = status;
        if (status === 'completed') updates.completed_at = new Date().toISOString();

        const { data: updated, error: updateError } = await supabase
            .from('grocery_lists')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({ success: true, message: 'Grocery list updated successfully', list: updated });
    } catch (error) {
        console.error('Error updating grocery list:', error);
        res.status(500).json({ error: 'Failed to update grocery list', details: error.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/groceries/:id  — delete a list (cascade deletes items via FK)
// ─────────────────────────────────────────────
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify ownership before deleting
        const { data: existing, error: fetchError } = await supabase
            .from('grocery_lists')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        // ON DELETE CASCADE in schema handles grocery_list_items automatically
        const { error: deleteError } = await supabase
            .from('grocery_lists')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({ success: true, message: 'Grocery list deleted successfully' });
    } catch (error) {
        console.error('Error deleting grocery list:', error);
        res.status(500).json({ error: 'Failed to delete grocery list', details: error.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/groceries/:id/items  — add item to existing list
// ─────────────────────────────────────────────
router.post('/:id/items', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, quantity, unit, category, estimatedPrice, notes, barcode } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        // Verify list ownership
        const { data: list, error: listError } = await supabase
            .from('grocery_lists')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', userId)
            .single();

        if (listError || !list) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        const { data: item, error: itemError } = await supabase
            .from('grocery_list_items')
            .insert({
                list_id: req.params.id,
                name: name.trim(),
                quantity: parseFloat(quantity) || 1,
                unit: unit || 'pieces',
                category: category || 'General',
                estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
                notes: notes || null,
                barcode: barcode || null,
                is_checked: false
            })
            .select()
            .single();

        if (itemError) throw itemError;

        await syncListCost(req.params.id);

        res.status(201).json({
            success: true,
            message: 'Item added to grocery list',
            item: {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                isChecked: item.is_checked,
                estimatedPrice: item.estimated_price,
                notes: item.notes
            }
        });
    } catch (error) {
        console.error('Error adding grocery item:', error);
        res.status(500).json({ error: 'Failed to add item', details: error.message });
    }
});

// ─────────────────────────────────────────────
// PATCH /api/groceries/:listId/items/:itemId/toggle  — toggle is_checked
// When checked → auto-add item to pantry
// ─────────────────────────────────────────────
router.patch('/:listId/items/:itemId/toggle', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify list ownership and get household_id
        const { data: list, error: listError } = await supabase
            .from('grocery_lists')
            .select('id, household_id')
            .eq('id', req.params.listId)
            .eq('user_id', userId)
            .single();

        if (listError || !list) {
            return res.status(404).json({ success: false, error: 'Grocery list not found' });
        }

        // Get current item with full details
        const { data: existing, error: fetchError } = await supabase
            .from('grocery_list_items')
            .select('*')
            .eq('id', req.params.itemId)
            .eq('list_id', req.params.listId)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        const newCheckedState = !existing.is_checked;

        const { data: item, error: updateError } = await supabase
            .from('grocery_list_items')
            .update({ is_checked: newCheckedState, updated_at: new Date().toISOString() })
            .eq('id', req.params.itemId)
            .select()
            .single();

        if (updateError) throw updateError;

        // Auto-add to pantry when item is checked (purchased)
        let addedToPantry = false;
        if (newCheckedState) {
            try {
                // Check if item already exists in pantry (by name, same scope)
                let pantryQuery = supabase
                    .from('pantry_items')
                    .select('id, quantity')
                    .ilike('name', existing.name)
                    .eq('is_archived', false);

                if (list.household_id) {
                    pantryQuery = pantryQuery.eq('household_id', list.household_id);
                } else {
                    pantryQuery = pantryQuery.eq('user_id', userId).is('household_id', null);
                }

                const { data: existingPantry } = await pantryQuery.maybeSingle();

                if (existingPantry) {
                    // Update quantity of existing pantry item
                    await supabase
                        .from('pantry_items')
                        .update({
                            quantity: existingPantry.quantity + (existing.quantity || 1),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingPantry.id);
                } else {
                    // Create new pantry item
                    await supabase
                        .from('pantry_items')
                        .insert({
                            user_id: userId,
                            name: existing.name,
                            quantity: existing.quantity || 1,
                            unit: existing.unit || 'pieces',
                            category: existing.category || 'General',
                            purchase_date: new Date().toISOString().split('T')[0],
                            estimated_price: existing.estimated_price || null,
                            household_id: list.household_id || null,
                            is_archived: false
                        });
                }
                addedToPantry = true;
            } catch (pantryErr) {
                console.error('Auto-add to pantry failed (non-blocking):', pantryErr.message);
            }
        }

        res.json({
            success: true,
            message: newCheckedState
                ? (addedToPantry ? 'Item purchased — added to pantry' : 'Item checked off')
                : 'Item unchecked',
            item: {
                id: item.id,
                name: item.name,
                isChecked: item.is_checked
            },
            addedToPantry
        });
    } catch (error) {
        console.error('Error toggling grocery item:', error);
        res.status(500).json({ error: 'Failed to update item status', details: error.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/groceries/:listId/items/:itemId  — remove single item
// ─────────────────────────────────────────────
router.delete('/:listId/items/:itemId', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify list ownership
        const { data: list, error: listError } = await supabase
            .from('grocery_lists')
            .select('id')
            .eq('id', req.params.listId)
            .eq('user_id', userId)
            .single();

        if (listError || !list) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        const { error: deleteError } = await supabase
            .from('grocery_list_items')
            .delete()
            .eq('id', req.params.itemId)
            .eq('list_id', req.params.listId);

        if (deleteError) throw deleteError;

        await syncListCost(req.params.listId);

        res.json({ success: true, message: 'Item removed from grocery list' });
    } catch (error) {
        console.error('Error removing grocery item:', error);
        res.status(500).json({ error: 'Failed to remove item', details: error.message });
    }
});

module.exports = router;
