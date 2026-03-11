const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI/Ollama client
const openai = new OpenAI({
    apiKey: process.env.USE_OLLAMA === 'true' ? 'ollama' : process.env.OPENAI_API_KEY,
    baseURL: process.env.USE_OLLAMA === 'true' ? process.env.OLLAMA_BASE_URL : undefined
});

const getModelName = () => process.env.USE_OLLAMA === 'true'
    ? process.env.OLLAMA_MODEL
    : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

/**
 * GET /api/meal-planner
 * List all meal plans for the authenticated user
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal plans:', error);
      return res.status(500).json({ error: 'Failed to fetch meal plans', details: error.message });
    }

    res.json({ plans: data || [] });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans', details: error.message });
  }
});

/**
 * POST /api/meal-planner
 * Create a new meal plan
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, start_date, end_date, meals, notes } = req.body;

    const startDate = start_date || new Date().toISOString().split('T')[0];
    const defaultEndDate = new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        name: name || 'My Meal Plan',
        start_date: startDate,
        end_date: end_date || defaultEndDate,
        meals: meals || {},
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      return res.status(500).json({ error: 'Failed to create meal plan', details: error.message });
    }

    res.status(201).json({ plan: data });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(500).json({ error: 'Failed to create meal plan', details: error.message });
  }
});

/**
 * PUT /api/meal-planner/:id
 * Update a meal plan (save the full meals JSONB)
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, meals, notes, start_date, end_date } = req.body;

    const updates = {};
    if (meals !== undefined) updates.meals = meals;
    if (name !== undefined) updates.name = name;
    if (notes !== undefined) updates.notes = notes;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;

    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal plan:', error);
      return res.status(500).json({ error: 'Failed to update meal plan', details: error.message });
    }

    res.json({ plan: data });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ error: 'Failed to update meal plan', details: error.message });
  }
});

/**
 * DELETE /api/meal-planner/:id
 * Delete a meal plan
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting meal plan:', error);
      return res.status(500).json({ error: 'Failed to delete meal plan', details: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Failed to delete meal plan', details: error.message });
  }
});

// Mock recipe database (expanded from smart-features)
const recipeDatabase = [
    {
        id: '1',
        name: 'Creamy Mushroom & Spinach Chicken',
        ingredients: ['Chicken Breast', 'Spinach', 'Mushrooms', 'Double Cream', 'Garlic', 'Onion'],
        tags: ['Dinner', 'Chicken', 'Creamy']
    },
    {
        id: '2',
        name: 'Vegetable Stir Fry',
        ingredients: ['Bell Peppers', 'Mushrooms', 'Carrots', 'Soy Sauce', 'Ginger', 'Noodles'],
        tags: ['Dinner', 'Vegetarian', 'Quick']
    },
    {
        id: '3',
        name: 'Omelette',
        ingredients: ['Eggs', 'Cheese', 'Spinach', 'Mushrooms'],
        tags: ['Breakfast', 'Vegetarian', 'High Protein']
    },
    {
        id: '4',
        name: 'Yogurt Parfait',
        ingredients: ['Greek Yogurt', 'Berries', 'Honey', 'Granola'],
        tags: ['Breakfast', 'Vegetarian', 'Quick']
    },
    {
        id: '5',
        name: 'Chicken Salad',
        ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive Oil'],
        tags: ['Lunch', 'Healthy', 'Chicken']
    },
    {
        id: '6',
        name: 'Pasta Bolognese',
        ingredients: ['Pasta', 'Beef Mince', 'Tomato Sauce', 'Onion', 'Garlic'],
        tags: ['Dinner', 'Comfort Food']
    },
    {
        id: '7',
        name: 'Grilled Cheese Sandwich',
        ingredients: ['Bread', 'Cheese', 'Butter'],
        tags: ['Lunch', 'Vegetarian', 'Quick']
    },
    {
        id: '8',
        name: 'Avocado Toast',
        ingredients: ['Bread', 'Avocado', 'Eggs', 'Chilli Flakes'],
        tags: ['Breakfast', 'Vegetarian', 'Trendy']
    }
];

// Helper: Find matching recipes for expiring items
const findRecipesUsingItems = (items) => {
    if (!items || items.length === 0) return [];
    const itemNames = items.map(i => i.name.toLowerCase());

    return recipeDatabase.map(recipe => {
        const matchCount = recipe.ingredients.filter(ing =>
            itemNames.some(itemName => itemName.includes(ing.toLowerCase()) || ing.toLowerCase().includes(itemName))
        ).length;
        return { ...recipe, matchCount };
    }).filter(r => r.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);
};

// Endpoint: Generate Weekly Meal Plan (LLM-powered with waste prevention)
router.post('/generate', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { pantryItems, preferences } = req.body;

        // Fetch actual pantry items if not provided
        let items = pantryItems || [];
        if (items.length === 0) {
            const { data } = await supabase
                .from('pantry_items')
                .select('name, category, quantity, unit, expiry_date')
                .eq('user_id', userId)
                .eq('is_archived', false)
                .order('expiry_date');
            items = data || [];
        }

        // Sort by expiry date and identify what's expiring soon
        const now = new Date();
        const sorted = items.sort((a, b) =>
            new Date(a.expiry_date || '2099-01-01') - new Date(b.expiry_date || '2099-01-01')
        );
        const expiringSoon = sorted.filter(i => {
            if (!i.expiry_date) return false;
            const daysLeft = (new Date(i.expiry_date) - now) / 86400000;
            return daysLeft >= 0 && daysLeft <= 5;
        });

        // Try LLM-powered generation first
        let llmPlan = null;
        try {
            const expiringList = expiringSoon.length > 0
                ? expiringSoon.map(i => `${i.name} (expires ${i.expiry_date})`).join(', ')
                : 'None expiring soon';
            const otherItems = sorted
                .filter(i => !expiringSoon.includes(i))
                .slice(0, 15)
                .map(i => i.name)
                .join(', ');

            const prompt = `Create a 7-day meal plan (Monday-Sunday, with Breakfast, Lunch, Dinner each day) that PRIORITISES using these expiring items first:
Expiring soon: ${expiringList}
Other available items: ${otherItems || 'basic staples'}
${preferences ? `Preferences: ${JSON.stringify(preferences)}` : ''}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{"Monday":{"Breakfast":{"name":"...","ingredients":["..."]},"Lunch":{"name":"...","ingredients":["..."]},"Dinner":{"name":"...","ingredients":["..."]}},"Tuesday":{...},...}

Rules:
- Use expiring items in the first 2-3 days
- Keep meals simple and practical
- UK-style meals and ingredients
- Each meal needs a name and ingredients list`;

            const completion = await openai.chat.completions.create({
                model: getModelName(),
                messages: [
                    { role: 'system', content: 'You are a UK meal planner focused on reducing food waste. Return only valid JSON, no markdown.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.5
            });

            const raw = completion.choices[0].message.content.trim();
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                llmPlan = JSON.parse(jsonMatch[0]);
            }
        } catch (llmError) {
            console.error('LLM meal plan generation failed:', llmError.message);
        }

        // If LLM succeeded, use that plan
        if (llmPlan && Object.keys(llmPlan).length >= 5) {
            return res.json({
                success: true,
                plan: llmPlan,
                source: 'ai',
                expiringItemsUsed: expiringSoon.map(i => i.name)
            });
        }

        // Fallback: recipe database matching (original logic)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
        const plan = {};
        let usedRecipes = new Set();

        days.forEach(day => {
            plan[day] = {};
            mealTypes.forEach(type => {
                const typeRecipes = recipeDatabase.filter(r => r.tags.includes(type));
                const availableRecipes = typeRecipes.filter(r => !usedRecipes.has(r.id));
                const pool = availableRecipes.length > 0 ? availableRecipes : typeRecipes;

                if (pool.length > 0) {
                    const selected = pool[Math.floor(Math.random() * pool.length)];
                    usedRecipes.add(selected.id);
                    plan[day][type] = selected;
                } else {
                    plan[day][type] = { name: 'Leftovers / Dining Out', ingredients: [] };
                }
            });
        });

        res.json({ success: true, plan, source: 'database' });

    } catch (error) {
        console.error('Error generating meal plan:', error);
        res.status(500).json({ error: 'Failed to generate meal plan', details: error.message });
    }
});

// Endpoint: Generate Shopping List from Plan
router.post('/shopping-list', (req, res) => {
    const { plan, pantryItems } = req.body;
    const missingIngredients = {};

    // Normalize pantry item names for comparison
    const pantryNames = new Set((pantryItems || []).map(i => i.name.toLowerCase()));

    Object.values(plan).forEach(dayMeals => {
        Object.values(dayMeals).forEach(meal => {
            if (meal.ingredients) {
                meal.ingredients.forEach(ing => {
                    // Check if we have it
                    const isAvailable = Array.from(pantryNames).some(pName =>
                        pName.includes(ing.toLowerCase()) || ing.toLowerCase().includes(pName)
                    );

                    if (!isAvailable) {
                        missingIngredients[ing] = (missingIngredients[ing] || 0) + 1;
                    }
                });
            }
        });
    });

    // Convert to array
    const shoppingList = Object.keys(missingIngredients).map(name => ({
        name,
        quantity: missingIngredients[name],
        checked: false
    }));

    res.json({ success: true, shoppingList });
});

module.exports = router;
