const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

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

        // Spawn python process
        const pythonProcess = spawn('python', [scriptPath]);

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

module.exports = router;
