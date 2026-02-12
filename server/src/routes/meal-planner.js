const express = require('express');
const router = express.Router();

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

// Endpoint: Generate Weekly Meal Plan
router.post('/generate', (req, res) => {
    const { pantryItems, preferences } = req.body;

    // Identify expiring items (simple logic: looking for expiryDate close to now, or just passed in 'expiringItems')
    // For this mock, we assume the frontend sends the relevant expiring items or the backend calculates it.
    // We'll prioritize items passed in 'pantryItems' that are flagged as expiring (if available) or just simple random selection if not.

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const plan = {};

    let usedRecipes = new Set();

    days.forEach(day => {
        plan[day] = {};
        mealTypes.forEach(type => {
            // 1. Try to find a recipe using pantry ingredients first
            // 2. Filter by meal type tags
            // 3. Pick random if no match

            const typeRecipes = recipeDatabase.filter(r => r.tags.includes(type));
            let selectedRecipe = null;

            // Try to prioritize unused recipes to add variety
            const availableRecipes = typeRecipes.filter(r => !usedRecipes.has(r.id));
            const pool = availableRecipes.length > 0 ? availableRecipes : typeRecipes;

            if (pool.length > 0) {
                selectedRecipe = pool[Math.floor(Math.random() * pool.length)];
                usedRecipes.add(selectedRecipe.id);
            }

            if (selectedRecipe) {
                plan[day][type] = selectedRecipe;
            } else {
                // Fallback for demo
                plan[day][type] = { name: 'Leftovers / Dining Out', ingredients: [] };
            }
        });
    });

    res.json({ success: true, plan });
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
