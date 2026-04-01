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

/**
 * Helper: check if user can access a pantry item (owner or household member)
 */
async function canAccessItem(userId, item) {
  if (item.user_id === userId) return true;
  if (item.household_id) {
    const householdId = await getUserHouseholdId(userId);
    return householdId === item.household_id;
  }
  return false;
}

/**
 * GET /api/pantry
 * Get all pantry items for the authenticated user
 * Query params: category, expiringSoon, lowStock, scope (personal|household)
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { category, expiringSoon, lowStock, scope } = req.query;
    const userId = req.user.id;

    // Start building the query
    let query = supabase
      .from('pantry_items')
      .select('*')
      .eq('is_archived', false)
      .order('expiry_date', { ascending: true });

    if (scope === 'household') {
      // Household scope: show items shared with user's household
      const householdId = await getUserHouseholdId(userId);
      if (!householdId) {
        return res.json({ items: [] });
      }
      query = query.eq('household_id', householdId);
    } else {
      // Personal scope (default): user's own items with no household_id
      query = query.eq('user_id', userId).is('household_id', null);
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by expiring soon (within 7 days)
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      query = query
        .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0]);
    }

    // Filter by low stock (quantity <= 1)
    if (lowStock === 'true') {
      query = query.lte('quantity', 1);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching pantry items:', error);
      return res.status(500).json({
        error: 'Failed to fetch pantry items',
        details: error.message
      });
    }

    res.json({ items: items || [] });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({
      error: 'Failed to fetch pantry items',
      details: error.message
    });
  }
});

/**
 * GET /api/pantry/stats
 * Get pantry statistics for the authenticated user
 */
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scope } = req.query;

    // Get all pantry items for calculations
    let query = supabase
      .from('pantry_items')
      .select('*')
      .eq('is_archived', false);

    if (scope === 'household') {
      const householdId = await getUserHouseholdId(userId);
      if (!householdId) {
        return res.json({
          totalItems: 0, totalValue: 0, categoryBreakdown: {},
          expiringSoon: 0, expired: 0, lowStock: 0, averageItemValue: 0
        });
      }
      query = query.eq('household_id', householdId);
    } else {
      query = query.eq('user_id', userId).is('household_id', null);
    }

    const { data: items, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate statistics
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (parseFloat(item.estimated_price) || 0), 0),
      categoryBreakdown: {},
      expiringSoon: items.filter(item => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        return expiryDate >= now && expiryDate <= threeDaysFromNow;
      }).length,
      expired: items.filter(item => {
        if (!item.expiry_date) return false;
        return new Date(item.expiry_date) < now;
      }).length,
      lowStock: items.filter(item => parseFloat(item.quantity) <= 1).length,
      averageItemValue: items.length > 0
        ? items.reduce((sum, item) => sum + (parseFloat(item.estimated_price) || 0), 0) / items.length
        : 0
    };

    // Calculate category breakdown
    items.forEach(item => {
      stats.categoryBreakdown[item.category] = (stats.categoryBreakdown[item.category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching pantry stats:', error);
    res.status(500).json({
      error: 'Failed to fetch pantry statistics',
      details: error.message
    });
  }
});

/**
 * GET /api/pantry/categories
 * Get all unique categories used by the user
 */
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: items, error } = await supabase
      .from('pantry_items')
      .select('category')
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (error) {
      throw error;
    }

    // Get unique categories
    const categories = [...new Set(items.map(item => item.category))].sort();

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

/**
 * GET /api/pantry/:id
 * Get a specific pantry item
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const { data: item, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pantry item not found' });
      }
      throw error;
    }

    if (!(await canAccessItem(userId, item))) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }



    res.json({ item });
  } catch (error) {
    console.error('Error fetching pantry item:', error);
    res.status(500).json({
      error: 'Failed to fetch pantry item',
      details: error.message
    });
  }
});

/**
 * POST /api/pantry
 * Add a new pantry item
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      quantity,
      unit,
      category,
      expiryDate,
      purchaseDate,
      estimatedPrice,
      actualPrice,
      barcode,
      storeName,
      brand,
      notes,
      imageUrl,
      householdId
    } = req.body;

    // Validate required fields
    if (!name || !quantity || !unit) {
      return res.status(400).json({
        error: 'Name, quantity, and unit are required'
      });
    }

    // If householdId is provided, verify user is a member
    let validatedHouseholdId = null;
    if (householdId) {
      const userHouseholdId = await getUserHouseholdId(userId);
      if (userHouseholdId !== householdId) {
        return res.status(403).json({ error: 'You are not a member of this household' });
      }
      validatedHouseholdId = householdId;
    }

    // Check if item already exists (by name and barcode in the correct scope)
    let itemQuery = supabase
      .from('pantry_items')
      .select('*')
      .eq('is_archived', false);

    if (validatedHouseholdId) {
      itemQuery = itemQuery.eq('household_id', validatedHouseholdId);
    } else {
      itemQuery = itemQuery.eq('user_id', userId).is('household_id', null);
    }

    let existingItem = null;
    if (barcode) {
      const { data } = await itemQuery.eq('barcode', barcode).single();
      existingItem = data;
    } else {
      const { data } = await itemQuery.eq('name', name).single();
      existingItem = data;
    }

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = parseFloat(existingItem.quantity) + parseFloat(quantity);

      const { data: updatedItem, error } = await supabase
        .from('pantry_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        item: updatedItem,
        message: 'Item quantity updated successfully'
      });
    }

    // Create new item
    const { data: item, error } = await supabase
      .from('pantry_items')
      .insert({
        user_id: userId,
        name,
        quantity: parseFloat(quantity),
        unit,
        category: category || 'General',
        expiry_date: expiryDate || null,
        purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
        actual_price: actualPrice ? parseFloat(actualPrice) : null,
        barcode: barcode || null,
        store_name: storeName || null,
        brand: brand || null,
        notes: notes || null,
        image_url: imageUrl || null,
        household_id: validatedHouseholdId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding pantry item:', error);
      throw error;
    }

    res.status(201).json({
      item,
      message: 'Pantry item added successfully'
    });
  } catch (error) {
    console.error('Error adding pantry item:', error);
    res.status(500).json({
      error: 'Failed to add pantry item',
      details: error.message
    });
  }
});

/**
 * PUT /api/pantry/:id
 * Update a pantry item
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const updateData = req.body;

    // Check if item exists and user can access it (owner or household member)
    const { data: existingItem, error: fetchError } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pantry item not found' });
      }
      throw fetchError;
    }

    if (!(await canAccessItem(userId, existingItem))) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }

    // Prepare update object (only include provided fields)
    const updates = {
      updated_at: new Date().toISOString()
    };

    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.quantity !== undefined) updates.quantity = parseFloat(updateData.quantity);
    if (updateData.unit !== undefined) updates.unit = updateData.unit;
    if (updateData.category !== undefined) updates.category = updateData.category;
    if (updateData.expiryDate !== undefined) updates.expiry_date = updateData.expiryDate;
    if (updateData.purchaseDate !== undefined) updates.purchase_date = updateData.purchaseDate;
    if (updateData.estimatedPrice !== undefined) updates.estimated_price = parseFloat(updateData.estimatedPrice);
    if (updateData.actualPrice !== undefined) updates.actual_price = parseFloat(updateData.actualPrice);
    if (updateData.barcode !== undefined) updates.barcode = updateData.barcode;
    if (updateData.storeName !== undefined) updates.store_name = updateData.storeName;
    if (updateData.brand !== undefined) updates.brand = updateData.brand;
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.imageUrl !== undefined) updates.image_url = updateData.imageUrl;

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('pantry_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      item: updatedItem,
      message: 'Pantry item updated successfully'
    });
  } catch (error) {
    console.error('Error updating pantry item:', error);
    res.status(500).json({
      error: 'Failed to update pantry item',
      details: error.message
    });
  }
});

/**
 * DELETE /api/pantry/:id
 * Delete (archive) a pantry item
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const hardDelete = req.query.hard === 'true';
    const reason = req.query.reason;

    // Check if item exists and user can access it
    const { data: existingItem, error: fetchError } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pantry item not found' });
      }
      throw fetchError;
    }

    if (!(await canAccessItem(userId, existingItem))) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }

    if (reason === 'consumed') {
      await supabase.from('consumption_logs').insert({
        user_id: existingItem.user_id,
        household_id: existingItem.household_id,
        name: existingItem.name,
        category: existingItem.category,
        quantity: existingItem.quantity,
        unit: existingItem.unit,
        price: existingItem.actual_price || existingItem.estimated_price
      });
    }

    if (hardDelete) {
      // Permanently delete the item
      const { error: deleteError } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      res.json({ message: 'Pantry item deleted permanently' });
    } else {
      // Soft delete (archive) the item
      const { error: updateError } = await supabase
        .from('pantry_items')
        .update({ is_archived: true })
        .eq('id', itemId);

      if (updateError) throw updateError;

      res.json({ message: 'Pantry item archived successfully' });
    }
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    res.status(500).json({
      error: 'Failed to delete pantry item',
      details: error.message
    });
  }
});

/**
 * POST /api/pantry/:id/consume
 * Consume (reduce quantity) of a pantry item
 */
router.post('/:id/consume', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get the item and verify access
    const { data: item, error: fetchError } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pantry item not found' });
      }
      throw fetchError;
    }

    if (!(await canAccessItem(userId, item))) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }

    const newQuantity = parseFloat(item.quantity) - parseFloat(amount);

    // Record consumption event
    await supabase.from('consumption_logs').insert({
      user_id: item.user_id,
      household_id: item.household_id,
      name: item.name,
      category: item.category,
      quantity: parseFloat(amount),
      unit: item.unit,
      price: item.actual_price || item.estimated_price
    });

    if (newQuantity <= 0) {
      // Archive item if quantity reaches 0
      const { error: updateError } = await supabase
        .from('pantry_items')
        .update({
          quantity: 0,
          is_archived: true
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      res.json({
        message: 'Item consumed and archived',
        quantity: 0
      });
    } else {
      // Update quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from('pantry_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({
        item: updatedItem,
        message: 'Item quantity updated'
      });
    }
  } catch (error) {
    console.error('Error consuming pantry item:', error);
    res.status(500).json({
      error: 'Failed to consume pantry item',
      details: error.message
    });
  }
});

module.exports = router;
