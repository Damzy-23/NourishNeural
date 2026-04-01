const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateJWT } = require('../middleware/supabaseAuth');

// All routes require authentication
router.use(authenticateJWT);

/**
 * Default nutrition profile values
 */
const DEFAULT_PROFILE = {
  dietaryType: 'omnivore',
  allergies: [],
  intolerances: [],
  dislikedIngredients: [],
  calorieTarget: 2000,
  proteinTarget: 50,
  carbTarget: 250,
  fatTarget: 70,
};

/**
 * Convert a DB row (snake_case) to camelCase response
 */
function toCamelCase(row) {
  return {
    id: row.id,
    userId: row.user_id,
    dietaryType: row.dietary_type,
    allergies: row.allergies || [],
    intolerances: row.intolerances || [],
    dislikedIngredients: row.disliked_ingredients || [],
    calorieTarget: row.calorie_target,
    proteinTarget: row.protein_target,
    carbTarget: row.carb_target,
    fatTarget: row.fat_target,
    householdId: row.household_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── GET NUTRITION PROFILE ───────────────────────────
// GET /api/nutrition
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found — return defaults
      return res.json({ ...DEFAULT_PROFILE, userId });
    }

    if (error) {
      console.error('Error fetching nutrition profile:', error);
      return res.status(500).json({ error: 'Failed to fetch nutrition profile' });
    }

    res.json(toCamelCase(data));
  } catch (err) {
    console.error('Nutrition profile GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPSERT NUTRITION PROFILE ────────────────────────
// PUT /api/nutrition
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      dietaryType,
      allergies,
      intolerances,
      dislikedIngredients,
      calorieTarget,
      proteinTarget,
      carbTarget,
      fatTarget,
    } = req.body;

    // Look up household_id from household_members
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    const { data, error } = await supabase
      .from('nutrition_profiles')
      .upsert(
        {
          user_id: userId,
          dietary_type: dietaryType,
          allergies: allergies || [],
          intolerances: intolerances || [],
          disliked_ingredients: dislikedIngredients || [],
          calorie_target: calorieTarget,
          protein_target: proteinTarget,
          carb_target: carbTarget,
          fat_target: fatTarget,
          household_id: membership?.household_id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting nutrition profile:', error);
      return res.status(500).json({ error: 'Failed to save nutrition profile' });
    }

    res.json(toCamelCase(data));
  } catch (err) {
    console.error('Nutrition profile PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET HOUSEHOLD NUTRITION PROFILES ────────────────
// GET /api/nutrition/household
router.get('/household', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's household_id
    const { data: membership, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    if (memberError && memberError.code === 'PGRST116') {
      return res.status(404).json({ error: 'You are not a member of any household' });
    }

    if (memberError) {
      console.error('Error fetching household membership:', memberError);
      return res.status(500).json({ error: 'Failed to fetch household membership' });
    }

    // Fetch all nutrition profiles for this household
    const { data: profiles, error: profilesError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('household_id', membership.household_id);

    if (profilesError) {
      console.error('Error fetching household nutrition profiles:', profilesError);
      return res.status(500).json({ error: 'Failed to fetch household nutrition profiles' });
    }

    // Get display names from user_profiles
    const userIds = profiles.map((p) => p.user_id);

    const { data: userProfiles, error: namesError } = await supabase
      .from('user_profiles')
      .select('id, first_name')
      .in('id', userIds);

    if (namesError) {
      console.error('Error fetching user profiles:', namesError);
    }

    const nameMap = {};
    if (userProfiles) {
      for (const up of userProfiles) {
        nameMap[up.id] = up.first_name;
      }
    }

    const result = profiles.map((row) => ({
      ...toCamelCase(row),
      firstName: nameMap[row.user_id] || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Household nutrition GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
