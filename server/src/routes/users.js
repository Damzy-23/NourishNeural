const express = require('express');
const { authenticateJWT } = require('../config/passport');
const { db } = require('../config/database');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user preferences
    const preferences = await db('user_preferences')
      .where({ user_id: req.user.id })
      .first();
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      preferences
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    
    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        isVerified: updatedUser.is_verified,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user preferences
router.get('/preferences', authenticateJWT, async (req, res) => {
  try {
    const preferences = await db('user_preferences')
      .where({ user_id: req.user.id })
      .first();
    
    if (!preferences) {
      return res.status(404).json({ error: 'User preferences not found' });
    }
    
    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticateJWT, async (req, res) => {
  try {
    const { dietaryRestrictions, budgetLimit, householdSize, preferredStores } = req.body;
    
    // Check if preferences exist
    const existingPreferences = await db('user_preferences')
      .where({ user_id: req.user.id })
      .first();
    
    let preferences;
    
    if (existingPreferences) {
      // Update existing preferences
      [preferences] = await db('user_preferences')
        .where({ user_id: req.user.id })
        .update({
          dietary_restrictions: dietaryRestrictions || existingPreferences.dietary_restrictions,
          budget_limit: budgetLimit || existingPreferences.budget_limit,
          household_size: householdSize || existingPreferences.household_size,
          preferred_stores: preferredStores || existingPreferences.preferred_stores,
          updated_at: new Date()
        })
        .returning('*');
    } else {
      // Create new preferences
      [preferences] = await db('user_preferences').insert({
        user_id: req.user.id,
        dietary_restrictions: dietaryRestrictions || [],
        budget_limit: budgetLimit || 100,
        household_size: householdSize || 1,
        preferred_stores: preferredStores || [],
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');
    }
    
    res.json({
      preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Get user statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    // Get grocery list statistics
    const groceryLists = await db('grocery_lists')
      .where({ user_id: req.user.id });
    
    const totalLists = groceryLists.length;
    const activeLists = groceryLists.filter(list => list.status === 'active').length;
    const completedLists = groceryLists.filter(list => list.status === 'completed').length;
    
    // Get pantry statistics
    const pantryItems = await db('pantry_items')
      .where({ user_id: req.user.id });
    
    const totalPantryItems = pantryItems.length;
    const expiringSoon = pantryItems.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const now = new Date();
      const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;
    
    // Get spending statistics
    const totalSpent = pantryItems.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
    
    res.json({
      stats: {
        groceryLists: {
          total: totalLists,
          active: activeLists,
          completed: completedLists
        },
        pantry: {
          totalItems: totalPantryItems,
          expiringSoon
        },
        spending: {
          totalSpent: Math.round(totalSpent * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router; 