const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const { calculateImpact, getBadgeForCarbon } = require('../utils/sustainability');

const router = express.Router();

/**
 * GET /api/sustainability/stats
 * Gets gamification stats based on consumption logs
 */
router.get('/stats', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { scope } = req.query; // 'personal' or 'household'

        let householdId = null;
        if (scope === 'household') {
            const { data } = await supabase
                .from('household_members')
                .select('household_id')
                .eq('user_id', userId)
                .single();
            householdId = data?.household_id;
            if (!householdId) {
                return res.json({
                    carbonSavedKg: 0, waterSavedLiters: 0, moneySaved: 0,
                    badge: getBadgeForCarbon(0), consumedItemsCount: 0
                });
            }
        }

        let query = supabase.from('consumption_logs').select('*');
        if (scope === 'household') {
            query = query.eq('household_id', householdId);
        } else {
            query = query.eq('user_id', userId).is('household_id', null);
        }

        const { data: logs, error } = await query;
        if (error) throw error;

        const impacts = calculateImpact(logs || []);
        const badge = getBadgeForCarbon(impacts.carbonSavedKg);

        res.json({
            carbonSavedKg: impacts.carbonSavedKg,
            waterSavedLiters: impacts.waterSavedLiters,
            moneySaved: impacts.moneySaved,
            badge: badge,
            consumedItemsCount: (logs || []).length
        });
    } catch (err) {
        console.error('Error fetching sustainability stats:', err);
        res.status(500).json({ error: 'Failed to fetch sustainability stats', details: err.message });
    }
});

module.exports = router;
