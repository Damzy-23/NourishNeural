const express = require('express');
const { authenticateJWT } = require('../config/passport');
const { db } = require('../config/database');

const router = express.Router();

// Get all grocery lists for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const lists = await db('grocery_lists')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    
    res.json({ lists });
  } catch (error) {
    console.error('Error fetching grocery lists:', error);
    res.status(500).json({ error: 'Failed to fetch grocery lists' });
  }
});

// Get a specific grocery list
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const list = await db('grocery_lists')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!list) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Get items for this list
    const items = await db('grocery_items')
      .where({ list_id: req.params.id })
      .orderBy('created_at', 'asc');
    
    res.json({ list: { ...list, items } });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    res.status(500).json({ error: 'Failed to fetch grocery list' });
  }
});

// Create a new grocery list
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, items, storeId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'List name is required' });
    }
    
    // Create the list
    const [list] = await db('grocery_lists').insert({
      name,
      user_id: req.user.id,
      store_id: storeId || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');
    
    // Add items if provided
    if (items && items.length > 0) {
      const groceryItems = items.map(item => ({
        list_id: list.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        estimated_price: item.estimatedPrice,
        notes: item.notes,
        barcode: item.barcode,
        is_checked: false,
        created_at: new Date()
      }));
      
      await db('grocery_items').insert(groceryItems);
    }
    
    // Fetch the complete list with items
    const completeList = await db('grocery_lists')
      .where({ id: list.id })
      .first();
    
    const listItems = await db('grocery_items')
      .where({ list_id: list.id });
    
    res.status(201).json({ 
      list: { ...completeList, items: listItems },
      message: 'Grocery list created successfully' 
    });
  } catch (error) {
    console.error('Error creating grocery list:', error);
    res.status(500).json({ error: 'Failed to create grocery list' });
  }
});

// Update a grocery list
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, storeId, status } = req.body;
    
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Update the list
    const [updatedList] = await db('grocery_lists')
      .where({ id: req.params.id })
      .update({
        name: name || existingList.name,
        store_id: storeId !== undefined ? storeId : existingList.store_id,
        status: status || existingList.status,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({ 
      list: updatedList,
      message: 'Grocery list updated successfully' 
    });
  } catch (error) {
    console.error('Error updating grocery list:', error);
    res.status(500).json({ error: 'Failed to update grocery list' });
  }
});

// Delete a grocery list
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Delete items first (due to foreign key constraint)
    await db('grocery_items').where({ list_id: req.params.id }).del();
    
    // Delete the list
    await db('grocery_lists').where({ id: req.params.id }).del();
    
    res.json({ message: 'Grocery list deleted successfully' });
  } catch (error) {
    console.error('Error deleting grocery list:', error);
    res.status(500).json({ error: 'Failed to delete grocery list' });
  }
});

// Add item to grocery list
router.post('/:id/items', authenticateJWT, async (req, res) => {
  try {
    const { name, quantity, unit, category, estimatedPrice, notes, barcode } = req.body;
    
    if (!name || !quantity || !unit) {
      return res.status(400).json({ error: 'Name, quantity, and unit are required' });
    }
    
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Add the item
    const [item] = await db('grocery_items').insert({
      list_id: req.params.id,
      name,
      quantity,
      unit,
      category: category || 'General',
      estimated_price: estimatedPrice,
      notes,
      barcode,
      is_checked: false,
      created_at: new Date()
    }).returning('*');
    
    res.status(201).json({ 
      item,
      message: 'Item added to grocery list successfully' 
    });
  } catch (error) {
    console.error('Error adding item to grocery list:', error);
    res.status(500).json({ error: 'Failed to add item to grocery list' });
  }
});

// Update grocery item
router.put('/:listId/items/:itemId', authenticateJWT, async (req, res) => {
  try {
    const { name, quantity, unit, category, estimatedPrice, notes, barcode, isChecked } = req.body;
    
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.listId, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Check if item exists
    const existingItem = await db('grocery_items')
      .where({ id: req.params.itemId, list_id: req.params.listId })
      .first();
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }
    
    // Update the item
    const [updatedItem] = await db('grocery_items')
      .where({ id: req.params.itemId })
      .update({
        name: name || existingItem.name,
        quantity: quantity !== undefined ? quantity : existingItem.quantity,
        unit: unit || existingItem.unit,
        category: category || existingItem.category,
        estimated_price: estimatedPrice !== undefined ? estimatedPrice : existingItem.estimated_price,
        notes: notes !== undefined ? notes : existingItem.notes,
        barcode: barcode !== undefined ? barcode : existingItem.barcode,
        is_checked: isChecked !== undefined ? isChecked : existingItem.is_checked
      })
      .returning('*');
    
    res.json({ 
      item: updatedItem,
      message: 'Grocery item updated successfully' 
    });
  } catch (error) {
    console.error('Error updating grocery item:', error);
    res.status(500).json({ error: 'Failed to update grocery item' });
  }
});

// Remove item from grocery list
router.delete('/:listId/items/:itemId', authenticateJWT, async (req, res) => {
  try {
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.listId, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Delete the item
    const deletedCount = await db('grocery_items')
      .where({ id: req.params.itemId, list_id: req.params.listId })
      .del();
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }
    
    res.json({ message: 'Item removed from grocery list successfully' });
  } catch (error) {
    console.error('Error removing item from grocery list:', error);
    res.status(500).json({ error: 'Failed to remove item from grocery list' });
  }
});

// Toggle item checked status
router.patch('/:listId/items/:itemId/toggle', authenticateJWT, async (req, res) => {
  try {
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.listId, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Get current item status
    const existingItem = await db('grocery_items')
      .where({ id: req.params.itemId, list_id: req.params.listId })
      .first();
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }
    
    // Toggle the checked status
    const [updatedItem] = await db('grocery_items')
      .where({ id: req.params.itemId })
      .update({ is_checked: !existingItem.is_checked })
      .returning('*');
    
    res.json({ 
      item: updatedItem,
      message: 'Item status updated successfully' 
    });
  } catch (error) {
    console.error('Error toggling item status:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// Get grocery list statistics
router.get('/:id/stats', authenticateJWT, async (req, res) => {
  try {
    // Check if list exists and belongs to user
    const existingList = await db('grocery_lists')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }
    
    // Get items for this list
    const items = await db('grocery_items')
      .where({ list_id: req.params.id });
    
    // Calculate statistics
    const totalItems = items.length;
    const checkedItems = items.filter(item => item.is_checked).length;
    const uncheckedItems = totalItems - checkedItems;
    const totalEstimatedCost = items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
    
    // Group by category
    const categoryBreakdown = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      stats: {
        totalItems,
        checkedItems,
        uncheckedItems,
        totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
        categoryBreakdown,
        completionPercentage: totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching grocery list stats:', error);
    res.status(500).json({ error: 'Failed to fetch grocery list statistics' });
  }
});

module.exports = router; 