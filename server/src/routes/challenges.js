const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');

const router = express.Router();

// ─── HELPER ──────────────────────────────────────────
/**
 * Get the household_id for a given user
 * @param {string} userId
 * @returns {string|null} household_id or null
 */
async function getUserHouseholdId(userId) {
  const { data, error } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching household for user:', error);
  }
  return data ? data.household_id : null;
}

// ─── BADGE THRESHOLDS ────────────────────────────────
const BADGE_DEFINITIONS = {
  first_save: {
    badge_type: 'first_save',
    badge_name: 'First Save',
    badge_description: 'Saved your first item from going to waste!'
  },
  ten_saved: {
    badge_type: 'ten_saved',
    badge_name: 'Waste Warrior',
    badge_description: 'Saved 10 items from going to waste!'
  },
  fifty_saved: {
    badge_type: 'fifty_saved',
    badge_name: 'Sustainability Hero',
    badge_description: 'Saved 50 items from going to waste!'
  },
  challenge_winner: {
    badge_type: 'challenge_winner',
    badge_name: 'Challenge Champion',
    badge_description: 'Reached the target score in a waste challenge!'
  }
};

/**
 * Check badge thresholds and award any newly earned badges.
 * @param {string} userId
 * @param {number} totalItemsSaved - cumulative items_saved across active challenges
 * @param {number} score - current score in the challenge
 * @param {number|null} targetValue - challenge target_value (for challenge_winner badge)
 */
async function checkAndAwardBadges(userId, totalItemsSaved, score, targetValue) {
  const badgesToCheck = [];

  if (totalItemsSaved >= 1) badgesToCheck.push('first_save');
  if (totalItemsSaved >= 10) badgesToCheck.push('ten_saved');
  if (totalItemsSaved >= 50) badgesToCheck.push('fifty_saved');
  if (targetValue && score >= targetValue) badgesToCheck.push('challenge_winner');

  for (const badgeType of badgesToCheck) {
    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_type', badgeType)
      .single();

    if (!existing) {
      const badge = BADGE_DEFINITIONS[badgeType];
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badge.badge_type,
          badge_name: badge.badge_name,
          badge_description: badge.badge_description
        });

      if (error) {
        console.error(`Error awarding badge ${badgeType}:`, error);
      } else {
        console.log(`🏅 Badge awarded to ${userId}: ${badge.badge_name}`);
      }
    }
  }
}

// ─── GET / — List active challenges ──────────────────
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: challenges, error } = await supabase
      .from('waste_challenges')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today);

    if (error) throw error;

    // Get participant counts for each challenge
    const challengesWithCounts = await Promise.all(
      (challenges || []).map(async (challenge) => {
        const { count, error: countError } = await supabase
          .from('challenge_participants')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);

        if (countError) {
          console.error('Error counting participants:', countError);
        }

        return {
          ...challenge,
          participant_count: count || 0
        };
      })
    );

    res.json(challengesWithCounts);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// ─── GET /my — User's household challenge participations ─
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = await getUserHouseholdId(userId);

    if (!householdId) {
      return res.json([]);
    }

    const { data: participations, error } = await supabase
      .from('challenge_participants')
      .select(`
        id,
        score,
        items_saved,
        waste_avoided_kg,
        joined_at,
        challenge_id,
        waste_challenges (
          id,
          title,
          description,
          challenge_type,
          target_value,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('household_id', householdId);

    if (error) throw error;

    // Add progress info
    const withProgress = (participations || []).map((p) => {
      const challenge = p.waste_challenges;
      const progress = challenge && challenge.target_value > 0
        ? Math.min(100, Math.round((p.score / challenge.target_value) * 100))
        : 0;

      return {
        ...p,
        progress_percent: progress,
        is_complete: challenge ? p.score >= challenge.target_value : false
      };
    });

    res.json(withProgress);
  } catch (err) {
    console.error('Error fetching user challenges:', err);
    res.status(500).json({ error: 'Failed to fetch your challenges' });
  }
});

// ─── POST /:id/join — Join a challenge ───────────────
router.post('/:id/join', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeId = req.params.id;

    // Get user's household
    const householdId = await getUserHouseholdId(userId);
    if (!householdId) {
      return res.status(400).json({ error: 'You must belong to a household to join a challenge' });
    }

    // Check challenge exists and is active
    const today = new Date().toISOString().split('T')[0];
    const { data: challenge, error: challengeError } = await supabase
      .from('waste_challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .gte('end_date', today)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'Challenge not found or is no longer active' });
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('household_id', householdId)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Your household has already joined this challenge' });
    }

    // Join the challenge
    const { data: participation, error: joinError } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        household_id: householdId,
        score: 0,
        items_saved: 0,
        waste_avoided_kg: 0
      })
      .select()
      .single();

    if (joinError) throw joinError;

    res.status(201).json(participation);
  } catch (err) {
    console.error('Error joining challenge:', err);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

// ─── GET /:id/leaderboard — Challenge leaderboard ────
router.get('/:id/leaderboard', authenticateJWT, async (req, res) => {
  try {
    const challengeId = req.params.id;

    const { data: leaderboard, error } = await supabase
      .from('challenge_participants')
      .select(`
        id,
        household_id,
        score,
        items_saved,
        waste_avoided_kg,
        joined_at,
        households (
          id,
          name
        )
      `)
      .eq('challenge_id', challengeId)
      .order('score', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Add rank
    const ranked = (leaderboard || []).map((entry, index) => ({
      rank: index + 1,
      household_name: entry.households ? entry.households.name : 'Unknown',
      household_id: entry.household_id,
      score: entry.score,
      items_saved: entry.items_saved,
      waste_avoided_kg: entry.waste_avoided_kg,
      joined_at: entry.joined_at
    }));

    res.json(ranked);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ─── POST /score-update — Internal score update ──────
// Called by other server routes (no auth required)
router.post('/score-update', async (req, res) => {
  try {
    const { userId, action, itemName, quantity } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    if (!['item_saved', 'item_wasted'].includes(action)) {
      return res.status(400).json({ error: 'action must be item_saved or item_wasted' });
    }

    const result = await updateChallengeScore(userId, action, itemName, quantity);
    res.json(result);
  } catch (err) {
    console.error('Error updating challenge score:', err);
    res.status(500).json({ error: 'Failed to update challenge score' });
  }
});

/**
 * Update challenge scores for a user's household.
 * Can be called directly by other routes or via the POST /score-update endpoint.
 *
 * @param {string} userId
 * @param {'item_saved'|'item_wasted'} action
 * @param {string} [itemName]
 * @param {number} [quantity]
 * @returns {object} { updated: number, badges_awarded: string[] }
 */
async function updateChallengeScore(userId, action, itemName, quantity) {
  const householdId = await getUserHouseholdId(userId);
  if (!householdId) {
    return { updated: 0, badges_awarded: [] };
  }

  // Find all active challenge participations for this household
  const today = new Date().toISOString().split('T')[0];
  const { data: participations, error } = await supabase
    .from('challenge_participants')
    .select(`
      id,
      score,
      items_saved,
      waste_avoided_kg,
      challenge_id,
      waste_challenges (
        id,
        target_value,
        is_active,
        end_date
      )
    `)
    .eq('household_id', householdId);

  if (error) {
    console.error('Error fetching participations for score update:', error);
    return { updated: 0, badges_awarded: [] };
  }

  // Filter to only active, non-expired challenges
  const activeParticipations = (participations || []).filter((p) => {
    const challenge = p.waste_challenges;
    return challenge && challenge.is_active && challenge.end_date >= today;
  });

  if (activeParticipations.length === 0) {
    return { updated: 0, badges_awarded: [] };
  }

  let totalItemsSaved = 0;

  for (const participation of activeParticipations) {
    const pointsDelta = action === 'item_saved' ? 10 : -5;
    const newScore = Math.max(0, participation.score + pointsDelta);
    const newItemsSaved = action === 'item_saved'
      ? participation.items_saved + 1
      : participation.items_saved;

    const updatePayload = {
      score: newScore,
      items_saved: newItemsSaved
    };

    const { error: updateError } = await supabase
      .from('challenge_participants')
      .update(updatePayload)
      .eq('id', participation.id);

    if (updateError) {
      console.error('Error updating participation score:', updateError);
    }

    totalItemsSaved = Math.max(totalItemsSaved, newItemsSaved);

    // Check badges for this challenge
    const targetValue = participation.waste_challenges
      ? participation.waste_challenges.target_value
      : null;

    await checkAndAwardBadges(userId, newItemsSaved, newScore, targetValue);
  }

  return { updated: activeParticipations.length, badges_awarded: [] };
}

// ─── GET /badges — User's earned badges ──────────────
router.get('/badges', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: badges, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    if (error) throw error;

    res.json(badges || []);
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

module.exports = router;
module.exports.updateChallengeScore = updateChallengeScore;
