const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/nutrition/today
 * Get today's nutrition logs and totals for the authenticated user
 * Query params: date (YYYY-MM-DD, defaults to today)
 */
router.get('/today', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const { data: logs, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching nutrition logs:', error);
      return res.status(500).json({ error: 'Failed to fetch nutrition logs', details: error.message });
    }

    const totals = (logs || []).reduce(
      (acc, log) => {
        acc.calories += Number(log.calories) || 0;
        acc.protein += Number(log.protein) || 0;
        acc.carbs += Number(log.carbs) || 0;
        acc.fat += Number(log.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ logs: logs || [], totals, date });
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition logs', details: error.message });
  }
});

/**
 * POST /api/nutrition/log
 * Save a food log entry
 */
router.post('/log', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, meal_type, food_name, calories, protein, carbs, fat, servings, notes } = req.body;

    if (!food_name) {
      return res.status(400).json({ error: 'food_name is required' });
    }

    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: userId,
        date: date || new Date().toISOString().split('T')[0],
        meal_type: meal_type || 'snack',
        food_name,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        servings: Number(servings) || 1,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving nutrition log:', error);
      return res.status(500).json({ error: 'Failed to save nutrition log', details: error.message });
    }

    res.status(201).json({ log: data });
  } catch (error) {
    console.error('Error saving nutrition log:', error);
    res.status(500).json({ error: 'Failed to save nutrition log', details: error.message });
  }
});

/**
 * DELETE /api/nutrition/log/:id
 * Delete a nutrition log entry
 */
router.delete('/log/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting nutrition log:', error);
      return res.status(500).json({ error: 'Failed to delete nutrition log', details: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    res.status(500).json({ error: 'Failed to delete nutrition log', details: error.message });
  }
});

/**
 * GET /api/nutrition/goals
 * Get the user's macro goals
 */
router.get('/goals', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching nutrition goals:', error);
      return res.status(500).json({ error: 'Failed to fetch nutrition goals', details: error.message });
    }

    // Return defaults if no goals set yet
    const goals = data || {
      daily_calories: 2000,
      daily_protein: 150,
      daily_carbs: 250,
      daily_fat: 65
    };

    res.json({ goals });
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition goals', details: error.message });
  }
});

/**
 * PUT /api/nutrition/goals
 * Upsert the user's macro goals
 */
router.put('/goals', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily_calories, daily_protein, daily_carbs, daily_fat } = req.body;

    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert({
        user_id: userId,
        daily_calories: Number(daily_calories) || 2000,
        daily_protein: Number(daily_protein) || 150,
        daily_carbs: Number(daily_carbs) || 250,
        daily_fat: Number(daily_fat) || 65,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating nutrition goals:', error);
      return res.status(500).json({ error: 'Failed to update nutrition goals', details: error.message });
    }

    res.json({ goals: data });
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    res.status(500).json({ error: 'Failed to update nutrition goals', details: error.message });
  }
});

/**
 * GET /api/nutrition/weekly
 * Get aggregated nutrition totals for the past 7 days
 */
router.get('/weekly', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];

    const { data: logs, error } = await supabase
      .from('nutrition_logs')
      .select('date, calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly nutrition:', error);
      return res.status(500).json({ error: 'Failed to fetch weekly nutrition', details: error.message });
    }

    // Aggregate by date
    const byDate = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      byDate[dateStr] = { date: dateStr, calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    (logs || []).forEach(log => {
      if (byDate[log.date]) {
        byDate[log.date].calories += Number(log.calories) || 0;
        byDate[log.date].protein += Number(log.protein) || 0;
        byDate[log.date].carbs += Number(log.carbs) || 0;
        byDate[log.date].fat += Number(log.fat) || 0;
      }
    });

    const weekly = Object.values(byDate).map(d => ({
      ...d,
      label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' })
    }));

    res.json({ weekly });
  } catch (error) {
    console.error('Error fetching weekly nutrition:', error);
    res.status(500).json({ error: 'Failed to fetch weekly nutrition', details: error.message });
  }
});

module.exports = router;
