const express = require('express');
const { authenticateJWT } = require('../config/passport');
const { db } = require('../config/database');

const router = express.Router();

// Get all pantry items for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { category, expiringSoon, lowStock } = req.query;
    
    let query = db('pantry_items').where({ user_id: req.user.id });
    
    // Filter by category
    if (category) {
      query = query.where({ category });
    }
    
    // Filter by expiring soon (within 7 days)
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      query = query.where('expiry_date', '<=', sevenDaysFromNow)
        .where('expiry_date', '>=', new Date());
    }
    
    // Filter by low stock (quantity <= 1)
    if (lowStock === 'true') {
      query = query.where('quantity', '<=', 1);
    }
    
    const items = await query.orderBy('expiry_date', 'asc');
    
    res.json({ items });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({ error: 'Failed to fetch pantry items' });
  }
});

// Get a specific pantry item
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const item = await db('pantry_items')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!item) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Error fetching pantry item:', error);
    res.status(500).json({ error: 'Failed to fetch pantry item' });
  }
});

// Add a new pantry item
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, quantity, unit, category, expiryDate, estimatedPrice, barcode, notes } = req.body;
    
    if (!name || !quantity || !unit) {
      return res.status(400).json({ error: 'Name, quantity, and unit are required' });
    }
    
    // Check if item already exists (by name and barcode)
    let existingItem = null;
    if (barcode) {
      existingItem = await db('pantry_items')
        .where({ user_id: req.user.id, barcode })
        .first();
    } else {
      existingItem = await db('pantry_items')
        .where({ user_id: req.user.id, name })
        .first();
    }
    
    if (existingItem) {
      // Update quantity of existing item
      const [updatedItem] = await db('pantry_items')
        .where({ id: existingItem.id })
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date()
        })
        .returning('*');
      
      return res.json({
        item: updatedItem,
        message: 'Item quantity updated successfully'
      });
    }
    
    // Create new item
    const [item] = await db('pantry_items').insert({
      user_id: req.user.id,
      name,
      quantity,
      unit,
      category: category || 'General',
      expiry_date: expiryDate,
      purchase_date: new Date(),
      estimated_price: estimatedPrice,
      barcode,
      notes,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');
    
    res.status(201).json({
      item,
      message: 'Pantry item added successfully'
    });
  } catch (error) {
    console.error('Error adding pantry item:', error);
    res.status(500).json({ error: 'Failed to add pantry item' });
  }
});

// Update a pantry item
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, quantity, unit, category, expiryDate, estimatedPrice, barcode, notes } = req.body;
    
    // Check if item exists and belongs to user
    const existingItem = await db('pantry_items')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    // Update the item
    const [updatedItem] = await db('pantry_items')
      .where({ id: req.params.id })
      .update({
        name: name || existingItem.name,
        quantity: quantity !== undefined ? quantity : existingItem.quantity,
        unit: unit || existingItem.unit,
        category: category || existingItem.category,
        expiry_date: expiryDate !== undefined ? expiryDate : existingItem.expiry_date,
        estimated_price: estimatedPrice !== undefined ? estimatedPrice : existingItem.estimated_price,
        barcode: barcode !== undefined ? barcode : existingItem.barcode,
        notes: notes !== undefined ? notes : existingItem.notes,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({
      item: updatedItem,
      message: 'Pantry item updated successfully'
    });
  } catch (error) {
    console.error('Error updating pantry item:', error);
    res.status(500).json({ error: 'Failed to update pantry item' });
  }
});

// Delete a pantry item
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if item exists and belongs to user
    const existingItem = await db('pantry_items')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    // Delete the item
    await db('pantry_items').where({ id: req.params.id }).del();
    
    res.json({ message: 'Pantry item deleted successfully' });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    res.status(500).json({ error: 'Failed to delete pantry item' });
  }
});

// Update pantry item quantity
router.patch('/:id/quantity', authenticateJWT, async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add', 'subtract', 'set'
    
    if (quantity === undefined || !operation) {
      return res.status(400).json({ error: 'Quantity and operation are required' });
    }
    
    // Check if item exists and belongs to user
    const existingItem = await db('pantry_items')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Pantry item not found' });
    }
    
    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = existingItem.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, existingItem.quantity - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation. Use "add", "subtract", or "set"' });
    }
    
    // Update the quantity
    const [updatedItem] = await db('pantry_items')
      .where({ id: req.params.id })
      .update({
        quantity: newQuantity,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({
      item: updatedItem,
      message: 'Quantity updated successfully'
    });
  } catch (error) {
    console.error('Error updating pantry item quantity:', error);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// Get pantry statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const items = await db('pantry_items').where({ user_id: req.user.id });
    
    // Calculate statistics
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
    
    // Group by category
    const categoryBreakdown = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].value += item.estimated_price || 0;
      return acc;
    }, {});
    
    // Expiry analysis
    const now = new Date();
    const expiringSoon = items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });
    
    const expired = items.filter(item => {
      if (!item.expiry_date) return false;
      return new Date(item.expiry_date) < now;
    });
    
    // Low stock items
    const lowStock = items.filter(item => item.quantity <= 1);
    
    res.json({
      stats: {
        totalItems,
        totalValue: Math.round(totalValue * 100) / 100,
        categoryBreakdown,
        expiringSoon: expiringSoon.length,
        expired: expired.length,
        lowStock: lowStock.length,
        averageItemValue: totalItems > 0 ? Math.round((totalValue / totalItems) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching pantry statistics:', error);
    res.status(500).json({ error: 'Failed to fetch pantry statistics' });
  }
});

// Get pantry categories
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const categories = await db('pantry_items')
      .where({ user_id: req.user.id })
      .select('category')
      .distinct()
      .orderBy('category');
    
    res.json({
      categories: categories.map(c => c.category || 'Uncategorized')
    });
  } catch (error) {
    console.error('Error fetching pantry categories:', error);
    res.status(500).json({ error: 'Failed to fetch pantry categories' });
  }
});

// Search pantry items
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = db('pantry_items')
      .where({ user_id: req.user.id })
      .where(function() {
        this.where('name', 'ilike', `%${q}%`)
          .orWhere('notes', 'ilike', `%${q}%`)
          .orWhere('barcode', 'ilike', `%${q}%`);
      });
    
    // Filter by category if specified
    if (category) {
      query = query.where({ category });
    }
    
    // Limit results
    query = query.limit(parseInt(limit));
    
    const items = await query.orderBy('name');
    res.json({ items });
  } catch (error) {
    console.error('Error searching pantry items:', error);
    res.status(500).json({ error: 'Failed to search pantry items' });
  }
});

module.exports = router; 