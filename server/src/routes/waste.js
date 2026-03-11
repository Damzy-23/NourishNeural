const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const { spawn } = require('child_process');
const path = require('path');
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
 * GET /api/waste/stats
 * Get detailed waste statistics for the authenticated user
 */
router.get('/stats', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { timeRange } = req.query; // 'week', 'month', 'year', 'all' default 'month'

        // Calculate start date based on timeRange
        let startDate = new Date();
        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (timeRange === 'all') {
            startDate = new Date(0); // Beginning of time
        } else {
            // Default to month
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const { data: wasteLogs, error } = await supabase
            .from('waste_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('wasted_at', startDate.toISOString());

        if (error) throw error;

        // Calculate aggregated stats
        const totalItems = wasteLogs.length;
        const totalLoss = wasteLogs.reduce((sum, item) => sum + (parseFloat(item.total_loss) || 0), 0);

        // Group by category to find most wasted
        const categoryCounts = {};
        wasteLogs.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, value: 0 };
            categoryCounts[cat].count++;
            categoryCounts[cat].value += (parseFloat(item.total_loss) || 0);
        });

        const categories = Object.keys(categoryCounts).map(cat => ({
            name: cat,
            count: categoryCounts[cat].count,
            value: categoryCounts[cat].value
        })).sort((a, b) => b.value - a.value);

        // Group by waste reason
        const reasonCounts = {};
        wasteLogs.forEach(item => {
            const reason = item.waste_reason || 'other';
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });

        res.json({
            summary: {
                totalItems,
                totalLoss,
                mostWastedCategory: categories.length > 0 ? categories[0].name : null,
                mostCommonReason: Object.keys(reasonCounts).sort((a, b) => reasonCounts[b] - reasonCounts[a])[0] || null
            },
            categories,
            reasons: reasonCounts,
            logs: wasteLogs
        });

    } catch (error) {
        console.error('Error fetching waste stats:', error);
        res.status(500).json({
            error: 'Failed to fetch waste statistics',
            details: error.message
        });
    }
});

/**
 * POST /api/waste
 * Log a new wasted item
 */
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            pantryItemId,
            itemName,
            category,
            quantity,
            unit,
            costPerUnit,
            wasteReason,
            notes,
            deletePantryItem // boolean: true = delete/archive original pantry item
        } = req.body;

        if (!itemName || !quantity) {
            return res.status(400).json({ error: 'Item name and quantity are required' });
        }

        const totalLoss = parseFloat(quantity) * (parseFloat(costPerUnit) || 0);

        // 1. Log the waste
        const { data: newLog, error: logError } = await supabase
            .from('waste_logs')
            .insert({
                user_id: userId,
                pantry_item_id: pantryItemId || null,
                item_name: itemName,
                category: category || 'General',
                quantity: parseFloat(quantity),
                unit,
                cost_per_unit: parseFloat(costPerUnit) || 0,
                total_loss: totalLoss,
                waste_reason: wasteReason || 'expired',
                notes,
                wasted_at: new Date().toISOString()
            })
            .select()
            .single();

        if (logError) throw logError;

        // 2. Archive/Delete associated pantry item if requested
        if (deletePantryItem && pantryItemId) {
            // First check if it exists so we don't error out
            const { data: pantryItem } = await supabase
                .from('pantry_items')
                .select('*')
                .eq('id', pantryItemId)
                .eq('user_id', userId)
                .single();

            if (pantryItem) {
                // Option A: Just archive it
                await supabase
                    .from('pantry_items')
                    .update({ is_archived: true, quantity: 0 })
                    .eq('id', pantryItemId);

                // Option B: Could hard delete if preferred, but archiving keeps history
            }
        }

        res.status(201).json({
            message: 'Waste logged successfully',
            log: newLog
        });

    } catch (error) {
        console.error('Error logging waste:', error);
        res.status(500).json({
            error: 'Failed to log waste',
            details: error.message
        });
    }
});

/**
 * POST /api/waste/predict
 * Predict waste probability for a food item using Python model
 */
router.post('/predict', authenticateJWT, async (req, res) => {
    try {
        const { food_item, user_history } = req.body;

        if (!food_item || !food_item.category) {
            return res.status(400).json({ error: 'Food item with category is required' });
        }

        // Path to python script
        const scriptPath = path.join(__dirname, '../../../ml-models/predict.py');

        // Use venv python if available, fall back to system python
        const pythonExe = process.env.PYTHON_PATH || 'python';
        const pythonProcess = spawn(pythonExe, [scriptPath]);

        let dataString = '';
        let errorString = '';

        // Write data to stdin
        pythonProcess.stdin.write(JSON.stringify({ food_item, user_history }));
        pythonProcess.stdin.end();

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        // Handle process close
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Stderr: ${errorString}`);
                return res.status(500).json({
                    error: 'Prediction failed',
                    details: errorString
                });
            }

            try {
                // Parse the output (last line should be the JSON)
                const lines = dataString.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const prediction = JSON.parse(lastLine);
                res.json(prediction);
            } catch (e) {
                console.error('Failed to parse Python output:', e);
                console.error('Output was:', dataString);
                // Even if parsing fails, we might have got some error in stdout
                if (dataString.includes('"error"')) {
                    try {
                        const errorJson = JSON.parse(dataString);
                        return res.status(500).json(errorJson);
                    } catch (e2) { }
                }
                res.status(500).json({ error: 'Failed to parse prediction result' });
            }
        });

    } catch (error) {
        console.error('Error in prediction endpoint:', error);
        res.status(500).json({ error: 'Internal server error during prediction' });
    }
});

/**
 * POST /api/waste/predict/explain
 * Get ML prediction + LLM natural-language explanation
 * Calls the Python model first, then asks the LLM to explain the result
 */
router.post('/predict/explain', authenticateJWT, async (req, res) => {
    try {
        const { food_item, user_history } = req.body;

        if (!food_item || !food_item.category) {
            return res.status(400).json({ error: 'Food item with category is required' });
        }

        // Step 1: Get ML prediction from Python model
        let prediction = null;
        try {
            prediction = await new Promise((resolve, reject) => {
                const scriptPath = path.join(__dirname, '../../../ml-models/predict.py');
                const pythonExe = process.env.PYTHON_PATH || 'python';
                const proc = spawn(pythonExe, [scriptPath]);

                let dataString = '';
                let errorString = '';

                proc.stdin.write(JSON.stringify({ food_item, user_history }));
                proc.stdin.end();

                proc.stdout.on('data', (data) => { dataString += data.toString(); });
                proc.stderr.on('data', (data) => { errorString += data.toString(); });

                proc.on('close', (code) => {
                    if (code !== 0) {
                        reject(new Error(errorString || 'Python prediction failed'));
                        return;
                    }
                    try {
                        const lines = dataString.trim().split('\n');
                        resolve(JSON.parse(lines[lines.length - 1]));
                    } catch (e) {
                        reject(new Error('Failed to parse prediction'));
                    }
                });

                setTimeout(() => { proc.kill(); reject(new Error('Prediction timeout')); }, 30000);
            });
        } catch (mlError) {
            console.error('ML prediction failed, using LLM-only mode:', mlError.message);
        }

        // Step 2: Get LLM explanation
        const itemDesc = [
            food_item.name || food_item.category,
            food_item.storage_type ? `stored in ${food_item.storage_type}` : null,
            food_item.days_since_purchase != null ? `purchased ${food_item.days_since_purchase} days ago` : null,
            food_item.quantity ? `quantity: ${food_item.quantity}${food_item.unit ? ' ' + food_item.unit : ''}` : null
        ].filter(Boolean).join(', ');

        const validPrediction = prediction && prediction.waste_probability != null && !prediction.error;
        const mlContext = validPrediction
            ? `ML Prediction: waste probability ${(prediction.waste_probability * 100).toFixed(0)}%, risk level: ${prediction.risk_level}, predicted days remaining: ${prediction.predicted_days || 'unknown'}, confidence: ${((prediction.confidence || 0.5) * 100).toFixed(0)}%`
            : 'No ML prediction available - provide your best assessment based on food science knowledge.';

        const prompt = `You are a food safety analyst. Given this food item and prediction data, provide a brief, practical explanation.

Food Item: ${itemDesc}
Category: ${food_item.category}
${mlContext}

In 2-3 sentences:
1. Explain why this item has this waste risk level
2. Give one actionable tip to prevent waste
3. Flag any safety concerns if relevant

Keep it conversational and practical. Do not use markdown formatting.`;

        let explanation = '';
        try {
            const completion = await openai.chat.completions.create({
                model: getModelName(),
                messages: [
                    { role: 'system', content: 'You are a food safety analyst. Be concise, practical, and UK-focused.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.3
            });
            explanation = completion.choices[0].message.content;
        } catch (llmError) {
            console.error('LLM explanation failed:', llmError.message);
            explanation = validPrediction
                ? `This ${food_item.category} item has a ${prediction.risk_level} waste risk. Consider using it soon or freezing it to prevent waste.`
                : `Check the expiry date on your ${food_item.category} item and use the "first in, first out" principle.`;
        }

        res.json({
            prediction: validPrediction ? prediction : {
                waste_probability: null,
                risk_level: 'unknown',
                note: prediction?.error || 'ML model unavailable, LLM explanation provided'
            },
            explanation
        });

    } catch (error) {
        console.error('Error in predict/explain:', error);
        res.status(500).json({ error: 'Failed to generate prediction explanation', details: error.message });
    }
});

/**
 * POST /api/waste/forecast
 * LLM-based waste trend forecasting from historical data
 * Uses the user's waste history to predict future waste patterns
 */
router.post('/forecast', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get past 12 weeks of waste data
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

        const { data: logs, error } = await supabase
            .from('waste_logs')
            .select('wasted_at, total_loss, category, waste_reason')
            .eq('user_id', userId)
            .gte('wasted_at', twelveWeeksAgo.toISOString())
            .order('wasted_at');

        if (error) throw error;

        // Aggregate into weekly totals
        const weeklyData = {};
        (logs || []).forEach(log => {
            const date = new Date(log.wasted_at);
            // Get ISO week start (Monday)
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];

            if (!weeklyData[weekStart]) {
                weeklyData[weekStart] = { total: 0, items: 0, categories: {} };
            }
            weeklyData[weekStart].total += parseFloat(log.total_loss) || 0;
            weeklyData[weekStart].items++;
            const cat = log.category || 'Other';
            weeklyData[weekStart].categories[cat] = (weeklyData[weekStart].categories[cat] || 0) + 1;
        });

        const weeks = Object.keys(weeklyData).sort();
        const historical = weeks.map(w => ({
            week: w,
            total: Math.round(weeklyData[w].total * 100) / 100,
            items: weeklyData[w].items,
            topCategory: Object.entries(weeklyData[w].categories)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || null
        }));

        // If not enough data, return what we have with a note
        if (historical.length < 2) {
            return res.json({
                historical,
                forecast: [],
                trend: 'insufficient_data',
                insight: 'Log more waste data to enable forecasting. We need at least 2 weeks of history.'
            });
        }

        // Build the LLM forecasting prompt
        const series = historical.map(w => `${w.week}: £${w.total.toFixed(2)} (${w.items} items)`).join('\n');
        const topCategories = {};
        (logs || []).forEach(l => {
            const cat = l.category || 'Other';
            topCategories[cat] = (topCategories[cat] || 0) + 1;
        });
        const catSummary = Object.entries(topCategories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat, count]) => `${cat} (${count})`)
            .join(', ');

        const prompt = `You are a food waste analyst for a UK household. Given the weekly waste data below, predict the next 4 weeks and identify the trend.

Weekly waste history:
${series}

Most wasted categories: ${catSummary}

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{"forecast": [{"week": "YYYY-MM-DD", "predicted_total": 0.00, "predicted_items": 0}], "trend": "improving|stable|worsening", "insight": "one sentence explanation", "tips": ["tip1", "tip2"]}

Base predictions on the actual pattern in the data. The "week" dates should continue from the last week in the history.`;

        let forecast = { forecast: [], trend: 'unknown', insight: 'Unable to generate forecast', tips: [] };

        try {
            const completion = await openai.chat.completions.create({
                model: getModelName(),
                messages: [
                    { role: 'system', content: 'You are a data analyst. Return only valid JSON, no markdown.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 400,
                temperature: 0.2
            });

            const raw = completion.choices[0].message.content.trim();
            // Try to extract JSON from the response
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                forecast = JSON.parse(jsonMatch[0]);
            }
        } catch (llmError) {
            console.error('LLM forecast failed:', llmError.message);
            // Simple arithmetic fallback
            const totals = historical.map(w => w.total);
            const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
            const recentAvg = totals.slice(-3).reduce((a, b) => a + b, 0) / Math.min(totals.length, 3);
            const trendDir = recentAvg < avg ? 'improving' : recentAvg > avg ? 'worsening' : 'stable';

            forecast = {
                forecast: [1, 2, 3, 4].map(i => {
                    const d = new Date(weeks[weeks.length - 1]);
                    d.setDate(d.getDate() + (i * 7));
                    return {
                        week: d.toISOString().split('T')[0],
                        predicted_total: Math.round(recentAvg * 100) / 100,
                        predicted_items: Math.round(historical.slice(-3).reduce((a, b) => a + b.items, 0) / Math.min(historical.length, 3))
                    };
                }),
                trend: trendDir,
                insight: `Based on your recent average of £${recentAvg.toFixed(2)}/week waste.`,
                tips: ['Try meal planning around expiring items', 'Check your fridge before shopping']
            };
        }

        res.json({ historical, ...forecast });

    } catch (error) {
        console.error('Error in waste forecast:', error);
        res.status(500).json({ error: 'Failed to generate waste forecast', details: error.message });
    }
});

module.exports = router;
