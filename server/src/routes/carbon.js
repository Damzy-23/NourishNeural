const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI/Ollama client (shared config)
const openai = new OpenAI({
    apiKey: process.env.USE_OLLAMA === 'true' ? 'ollama' : process.env.OPENAI_API_KEY,
    baseURL: process.env.USE_OLLAMA === 'true' ? process.env.OLLAMA_BASE_URL : undefined
});

const getModelName = () => process.env.USE_OLLAMA === 'true'
    ? process.env.OLLAMA_MODEL
    : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

/**
 * Derive a human-readable rating from CO2 per kg value.
 * low < 2, medium 2-10, high > 10
 */
function getRating(co2PerKg) {
    if (co2PerKg < 2) return 'low';
    if (co2PerKg <= 10) return 'medium';
    return 'high';
}

/**
 * GET /api/carbon/score/:itemName
 * Look up the carbon footprint score for a given food item.
 * Uses fuzzy (ilike) matching against the carbon_reference table.
 */
router.get('/score/:itemName', authenticateJWT, async (req, res) => {
    try {
        const { itemName } = req.params;

        if (!itemName || !itemName.trim()) {
            return res.status(400).json({ error: 'Item name is required' });
        }

        const searchTerm = itemName.trim();

        // Try exact ilike match first
        let { data, error } = await supabase
            .from('carbon_reference')
            .select('*')
            .ilike('item_name', searchTerm)
            .limit(1);

        if (error) throw error;

        // If no exact match, try partial match
        if (!data || data.length === 0) {
            ({ data, error } = await supabase
                .from('carbon_reference')
                .select('*')
                .ilike('item_name', `%${searchTerm}%`)
                .limit(1));

            if (error) throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'No carbon data found for this item',
                itemName: searchTerm
            });
        }

        const item = data[0];
        const co2PerKg = parseFloat(item.co2_per_kg);

        return res.json({
            itemName: item.item_name,
            co2PerKg,
            category: item.category,
            source: item.source,
            rating: getRating(co2PerKg)
        });
    } catch (err) {
        console.error('Carbon score lookup error:', err);
        return res.status(500).json({ error: 'Failed to look up carbon score' });
    }
});

/**
 * GET /api/carbon/stats
 * Aggregate carbon footprint stats from the authenticated user's pantry.
 */
router.get('/stats', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all non-archived pantry items for this user
        const { data: pantryItems, error: pantryError } = await supabase
            .from('pantry_items')
            .select('*')
            .eq('user_id', userId)
            .eq('is_archived', false);

        if (pantryError) throw pantryError;

        if (!pantryItems || pantryItems.length === 0) {
            return res.json({
                totalCo2Kg: 0,
                itemCount: 0,
                averageCo2PerItem: 0,
                rating: 'low',
                topItems: [],
                breakdown: []
            });
        }

        // Fetch all carbon reference data once to avoid N+1 queries
        const { data: carbonRef, error: carbonError } = await supabase
            .from('carbon_reference')
            .select('*');

        if (carbonError) throw carbonError;

        const carbonMap = carbonRef || [];

        // Helper: find best carbon match for a pantry item name
        function findCarbonMatch(name) {
            if (!name) return null;
            const lower = name.toLowerCase();

            // Exact match
            let match = carbonMap.find(c => c.item_name.toLowerCase() === lower);
            if (match) return match;

            // Partial match — reference item_name appears in pantry name or vice versa
            match = carbonMap.find(c =>
                lower.includes(c.item_name.toLowerCase()) ||
                c.item_name.toLowerCase().includes(lower)
            );
            return match || null;
        }

        let totalCo2Kg = 0;
        const itemScores = [];
        const categoryTotals = {};

        for (const item of pantryItems) {
            const match = findCarbonMatch(item.name);
            if (!match) continue;

            const co2PerKg = parseFloat(match.co2_per_kg);
            let quantity = parseFloat(item.quantity) || 1;
            // Normalise to kg based on unit
            const unit = (item.unit || '').toLowerCase();
            if (unit === 'g' || unit === 'grams' || unit === 'gram') quantity /= 1000;
            else if (unit === 'ml' || unit === 'millilitres') quantity /= 1000;
            else if (unit === 'pieces' || unit === 'packs' || unit === 'tins' || unit === 'bottles' || unit === 'slices') quantity *= 0.2; // ~200g per piece estimate
            const itemCo2 = co2PerKg * quantity;

            totalCo2Kg += itemCo2;
            itemScores.push({ name: item.name, co2: parseFloat(itemCo2.toFixed(2)) });

            const category = match.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + itemCo2;
        }

        // Sort top items by CO2 descending, take top 10
        const topItems = itemScores
            .sort((a, b) => b.co2 - a.co2)
            .slice(0, 10);

        // Build category breakdown sorted descending
        const breakdown = Object.entries(categoryTotals)
            .map(([category, co2]) => ({ category, co2: parseFloat(co2.toFixed(2)) }))
            .sort((a, b) => b.co2 - a.co2);

        const matchedCount = itemScores.length;
        const averageCo2PerItem = matchedCount > 0
            ? parseFloat((totalCo2Kg / matchedCount).toFixed(2))
            : 0;

        return res.json({
            totalCo2Kg: parseFloat(totalCo2Kg.toFixed(2)),
            itemCount: matchedCount,
            averageCo2PerItem,
            rating: getRating(averageCo2PerItem),
            topItems,
            breakdown
        });
    } catch (err) {
        console.error('Carbon stats error:', err);
        return res.status(500).json({ error: 'Failed to calculate carbon stats' });
    }
});

/**
 * POST /api/carbon/suggest-swaps
 * Given a list of item names, suggest lower-carbon alternatives.
 * Body: { items: ["beef", "milk", ...] }
 */
router.post('/suggest-swaps', authenticateJWT, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'A non-empty array of item names is required in the "items" field' });
        }

        // Fetch all carbon reference data
        const { data: carbonRef, error: carbonError } = await supabase
            .from('carbon_reference')
            .select('*');

        if (carbonError) throw carbonError;

        if (!carbonRef || carbonRef.length === 0) {
            return res.json({ swaps: [] });
        }

        // Build DB-based swaps
        const dbSwaps = [];

        for (const itemName of items) {
            const lower = itemName.toLowerCase().trim();

            // Find the item in carbon_reference
            const original = carbonRef.find(c =>
                c.item_name.toLowerCase() === lower ||
                lower.includes(c.item_name.toLowerCase()) ||
                c.item_name.toLowerCase().includes(lower)
            );

            if (!original) continue;

            const originalCo2 = parseFloat(original.co2_per_kg);

            // Find items in the same category with lower CO2
            const alternatives = carbonRef
                .filter(c =>
                    c.category === original.category &&
                    c.item_name.toLowerCase() !== original.item_name.toLowerCase() &&
                    parseFloat(c.co2_per_kg) < originalCo2
                )
                .sort((a, b) => parseFloat(a.co2_per_kg) - parseFloat(b.co2_per_kg));

            if (alternatives.length > 0) {
                const best = alternatives[0];
                const suggestionCo2 = parseFloat(best.co2_per_kg);
                const savingPercent = parseFloat(
                    (((originalCo2 - suggestionCo2) / originalCo2) * 100).toFixed(1)
                );

                dbSwaps.push({
                    original: original.item_name,
                    originalCo2,
                    suggestion: best.item_name,
                    suggestionCo2,
                    savingPercent
                });
            }
        }

        // Try LLM for richer suggestions
        try {
            const itemList = items.join(', ');
            const dbContext = dbSwaps.length > 0
                ? `\nDatabase suggestions so far:\n${dbSwaps.map(s => `- ${s.original} (${s.originalCo2} kg CO2/kg) → ${s.suggestion} (${s.suggestionCo2} kg CO2/kg)`).join('\n')}`
                : '';

            const completion = await openai.chat.completions.create({
                model: getModelName(),
                messages: [
                    {
                        role: 'system',
                        content: 'You are a food sustainability expert. Suggest lower-carbon food alternatives. Respond ONLY with valid JSON — no markdown, no explanation.'
                    },
                    {
                        role: 'user',
                        content: `Suggest lower-carbon swaps for these food items: ${itemList}.${dbContext}

Return a JSON array of objects with these exact fields:
{ "original": "item name", "originalCo2": number, "suggestion": "alternative", "suggestionCo2": number, "savingPercent": number }

Only include items where you can confidently suggest an alternative with a meaningful carbon saving. Use approximate kg CO2 per kg values.`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1024
            });

            const content = completion.choices?.[0]?.message?.content;
            if (content) {
                // Strip potential markdown fences
                const cleaned = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
                const llmSwaps = JSON.parse(cleaned);

                if (Array.isArray(llmSwaps) && llmSwaps.length > 0) {
                    // Merge: prefer LLM suggestions but keep DB ones for items LLM missed
                    const llmOriginals = new Set(llmSwaps.map(s => s.original.toLowerCase()));
                    const merged = [
                        ...llmSwaps.map(s => ({
                            original: s.original,
                            originalCo2: parseFloat(s.originalCo2) || 0,
                            suggestion: s.suggestion,
                            suggestionCo2: parseFloat(s.suggestionCo2) || 0,
                            savingPercent: parseFloat(s.savingPercent) || 0
                        })),
                        ...dbSwaps.filter(s => !llmOriginals.has(s.original.toLowerCase()))
                    ];

                    return res.json({ swaps: merged });
                }
            }
        } catch (llmErr) {
            console.warn('LLM swap suggestion failed, using DB-only results:', llmErr.message);
        }

        // Fall back to DB-only swaps
        return res.json({ swaps: dbSwaps });
    } catch (err) {
        console.error('Carbon swap suggestion error:', err);
        return res.status(500).json({ error: 'Failed to suggest carbon swaps' });
    }
});

module.exports = router;
