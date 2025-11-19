const express = require('express');
const router = express.Router();

// Mock data for smart features

// Substitution database
const substitutionDatabase = {
  'buttermilk': [
    {
      original: 'Buttermilk',
      substitute: 'Milk + Lemon Juice',
      ratio: '1 cup milk + 1 tbsp lemon juice',
      notes: 'Let sit for 5 minutes before using. Works great in baking.',
      quality: 'excellent'
    },
    {
      original: 'Buttermilk',
      substitute: 'Milk + Vinegar',
      ratio: '1 cup milk + 1 tbsp white vinegar',
      notes: 'Same process as lemon juice. Apple cider vinegar also works.',
      quality: 'excellent'
    },
    {
      original: 'Buttermilk',
      substitute: 'Plain Yogurt + Water',
      ratio: '3/4 cup yogurt + 1/4 cup water',
      notes: 'Blend until smooth. Adds extra tanginess.',
      quality: 'good'
    }
  ],
  'eggs': [
    {
      original: 'Eggs',
      substitute: 'Mashed Banana',
      ratio: '1 egg = 1/4 cup mashed banana',
      notes: 'Best for sweet baked goods. Adds banana flavor.',
      quality: 'good'
    },
    {
      original: 'Eggs',
      substitute: 'Applesauce',
      ratio: '1 egg = 1/4 cup applesauce',
      notes: 'Great for cakes and muffins. Use unsweetened.',
      quality: 'good'
    },
    {
      original: 'Eggs',
      substitute: 'Flax Egg',
      ratio: '1 egg = 1 tbsp ground flax + 3 tbsp water',
      notes: 'Let sit 5 minutes to gel. Works for binding.',
      quality: 'excellent'
    },
    {
      original: 'Eggs',
      substitute: 'Silken Tofu',
      ratio: '1 egg = 1/4 cup blended silken tofu',
      notes: 'Neutral flavor, great for dense baked goods.',
      quality: 'good'
    }
  ],
  'heavy cream': [
    {
      original: 'Heavy Cream',
      substitute: 'Coconut Cream',
      ratio: '1:1 replacement',
      notes: 'Adds slight coconut flavor. Great for whipping.',
      quality: 'excellent'
    },
    {
      original: 'Heavy Cream',
      substitute: 'Milk + Butter',
      ratio: '3/4 cup milk + 1/4 cup melted butter',
      notes: 'Good for sauces and soups. Won\'t whip.',
      quality: 'good'
    },
    {
      original: 'Heavy Cream',
      substitute: 'Evaporated Milk',
      ratio: '1:1 replacement',
      notes: 'Slightly sweeter taste. Works in most recipes.',
      quality: 'good'
    }
  ],
  'butter': [
    {
      original: 'Butter',
      substitute: 'Coconut Oil',
      ratio: '1:1 replacement',
      notes: 'Use refined for neutral flavor. Solid at room temp.',
      quality: 'excellent'
    },
    {
      original: 'Butter',
      substitute: 'Olive Oil',
      ratio: '1 cup butter = 3/4 cup olive oil',
      notes: 'Best for savory dishes. Strong flavor.',
      quality: 'good'
    },
    {
      original: 'Butter',
      substitute: 'Greek Yogurt',
      ratio: '1 cup butter = 1/2 cup yogurt',
      notes: 'Reduces fat content. Good for baking.',
      quality: 'acceptable'
    }
  ],
  'honey': [
    {
      original: 'Honey',
      substitute: 'Maple Syrup',
      ratio: '1:1 replacement',
      notes: 'Similar sweetness. Distinct maple flavor.',
      quality: 'excellent'
    },
    {
      original: 'Honey',
      substitute: 'Agave Nectar',
      ratio: '1:1 replacement',
      notes: 'Neutral flavor, less viscous. Vegan option.',
      quality: 'good'
    },
    {
      original: 'Honey',
      substitute: 'Molasses',
      ratio: '1 cup honey = 1 cup molasses',
      notes: 'Strong flavor, darker color. Reduce other sugars.',
      quality: 'acceptable'
    }
  ],
  'sour cream': [
    {
      original: 'Sour Cream',
      substitute: 'Greek Yogurt',
      ratio: '1:1 replacement',
      notes: 'Similar tanginess and texture. Lower in fat.',
      quality: 'excellent'
    },
    {
      original: 'Sour Cream',
      substitute: 'Cottage Cheese + Lemon',
      ratio: '1 cup blended cottage cheese + 2 tbsp lemon',
      notes: 'Blend until smooth. Adds protein.',
      quality: 'good'
    },
    {
      original: 'Sour Cream',
      substitute: 'Cream Cheese + Milk',
      ratio: '1 cup = 6 oz cream cheese + 2 tbsp milk',
      notes: 'Blend until smooth. Richer taste.',
      quality: 'good'
    }
  ]
};

// Mock recipe cost data
const recipeCosts = {
  'spaghetti-bolognese': {
    breakdown: [
      { ingredient: 'Spaghetti', quantity: '500g', pricePerUnit: 2.50, totalCost: 2.50, store: 'Walmart' },
      { ingredient: 'Ground Beef', quantity: '500g', pricePerUnit: 8.99, totalCost: 8.99, store: 'Costco' },
      { ingredient: 'Tomato Sauce', quantity: '400ml', pricePerUnit: 1.99, totalCost: 1.99, store: 'Walmart' },
      { ingredient: 'Onion', quantity: '1 medium', pricePerUnit: 0.50, totalCost: 0.50, store: 'Local Market' },
      { ingredient: 'Garlic', quantity: '3 cloves', pricePerUnit: 0.30, totalCost: 0.30, store: 'Local Market' },
      { ingredient: 'Olive Oil', quantity: '2 tbsp', pricePerUnit: 0.40, totalCost: 0.40, store: 'Walmart' },
      { ingredient: 'Parmesan', quantity: '50g', pricePerUnit: 2.50, totalCost: 2.50, store: 'Trader Joes' }
    ],
    servings: 4
  },
  'chicken-stir-fry': {
    breakdown: [
      { ingredient: 'Chicken Breast', quantity: '400g', pricePerUnit: 6.99, totalCost: 6.99, store: 'Costco' },
      { ingredient: 'Mixed Vegetables', quantity: '300g', pricePerUnit: 3.49, totalCost: 3.49, store: 'Walmart' },
      { ingredient: 'Soy Sauce', quantity: '3 tbsp', pricePerUnit: 0.45, totalCost: 0.45, store: 'Walmart' },
      { ingredient: 'Ginger', quantity: '1 inch', pricePerUnit: 0.35, totalCost: 0.35, store: 'Local Market' },
      { ingredient: 'Garlic', quantity: '2 cloves', pricePerUnit: 0.20, totalCost: 0.20, store: 'Local Market' },
      { ingredient: 'Sesame Oil', quantity: '1 tbsp', pricePerUnit: 0.50, totalCost: 0.50, store: 'Trader Joes' },
      { ingredient: 'Rice', quantity: '200g', pricePerUnit: 0.80, totalCost: 0.80, store: 'Walmart' }
    ],
    servings: 3
  },
  'vegetable-curry': {
    breakdown: [
      { ingredient: 'Chickpeas', quantity: '400g can', pricePerUnit: 1.29, totalCost: 1.29, store: 'Walmart' },
      { ingredient: 'Coconut Milk', quantity: '400ml', pricePerUnit: 2.49, totalCost: 2.49, store: 'Trader Joes' },
      { ingredient: 'Curry Paste', quantity: '2 tbsp', pricePerUnit: 0.80, totalCost: 0.80, store: 'Walmart' },
      { ingredient: 'Mixed Vegetables', quantity: '400g', pricePerUnit: 3.99, totalCost: 3.99, store: 'Costco' },
      { ingredient: 'Onion', quantity: '1 large', pricePerUnit: 0.60, totalCost: 0.60, store: 'Local Market' },
      { ingredient: 'Garlic', quantity: '3 cloves', pricePerUnit: 0.30, totalCost: 0.30, store: 'Local Market' },
      { ingredient: 'Basmati Rice', quantity: '200g', pricePerUnit: 1.20, totalCost: 1.20, store: 'Trader Joes' }
    ],
    servings: 4
  },
  'grilled-salmon': {
    breakdown: [
      { ingredient: 'Salmon Fillet', quantity: '400g', pricePerUnit: 12.99, totalCost: 12.99, store: 'Costco' },
      { ingredient: 'Lemon', quantity: '1 whole', pricePerUnit: 0.50, totalCost: 0.50, store: 'Local Market' },
      { ingredient: 'Asparagus', quantity: '200g', pricePerUnit: 3.99, totalCost: 3.99, store: 'Trader Joes' },
      { ingredient: 'Olive Oil', quantity: '2 tbsp', pricePerUnit: 0.40, totalCost: 0.40, store: 'Walmart' },
      { ingredient: 'Dill', quantity: '1 bunch', pricePerUnit: 1.99, totalCost: 1.99, store: 'Local Market' },
      { ingredient: 'Garlic', quantity: '2 cloves', pricePerUnit: 0.20, totalCost: 0.20, store: 'Local Market' }
    ],
    servings: 2
  }
};

// ============================================
// 1. Smart Leftover Recipe Matcher Endpoints
// ============================================

// Get items nearing expiration
router.get('/expiring-items', (req, res) => {
  const expiringItems = [
    { id: '1', name: 'Chicken Breast', quantity: 2, unit: 'lbs', expiryDate: '2024-01-20', daysUntilExpiry: 1 },
    { id: '2', name: 'Spinach', quantity: 1, unit: 'bag', expiryDate: '2024-01-21', daysUntilExpiry: 2 },
    { id: '3', name: 'Greek Yogurt', quantity: 2, unit: 'cups', expiryDate: '2024-01-22', daysUntilExpiry: 3 },
    { id: '4', name: 'Bell Peppers', quantity: 3, unit: 'pieces', expiryDate: '2024-01-23', daysUntilExpiry: 4 },
    { id: '5', name: 'Mushrooms', quantity: 1, unit: 'pack', expiryDate: '2024-01-24', daysUntilExpiry: 5 }
  ];
  res.json(expiringItems);
});

// Get recipes that use expiring ingredients
router.get('/leftover-recipes', (req, res) => {
  const recipes = [
    {
      id: '1',
      name: 'Chicken Spinach Stir Fry',
      matchingIngredients: ['Chicken Breast', 'Spinach', 'Bell Peppers'],
      missingIngredients: ['Soy Sauce', 'Garlic'],
      matchScore: 85,
      prepTime: 25,
      servings: 4,
      imageUrl: null
    },
    {
      id: '2',
      name: 'Greek Yogurt Chicken Bowl',
      matchingIngredients: ['Chicken Breast', 'Greek Yogurt', 'Bell Peppers'],
      missingIngredients: ['Cucumber', 'Feta Cheese'],
      matchScore: 75,
      prepTime: 30,
      servings: 2,
      imageUrl: null
    },
    {
      id: '3',
      name: 'Stuffed Bell Peppers',
      matchingIngredients: ['Bell Peppers', 'Chicken Breast', 'Mushrooms'],
      missingIngredients: ['Rice', 'Tomato Sauce', 'Cheese'],
      matchScore: 65,
      prepTime: 45,
      servings: 4,
      imageUrl: null
    },
    {
      id: '4',
      name: 'Spinach Mushroom Omelette',
      matchingIngredients: ['Spinach', 'Mushrooms'],
      missingIngredients: ['Eggs', 'Cheese'],
      matchScore: 60,
      prepTime: 15,
      servings: 2,
      imageUrl: null
    }
  ];
  res.json(recipes);
});

// ============================================
// 2. Ingredient Substitution Engine Endpoints
// ============================================

router.get('/substitutions', (req, res) => {
  const ingredient = (req.query.ingredient || '').toLowerCase().trim();

  if (!ingredient) {
    return res.json([]);
  }

  // Search for substitutions
  const substitutions = substitutionDatabase[ingredient] || [];

  // If no exact match, search for partial matches
  if (substitutions.length === 0) {
    for (const key of Object.keys(substitutionDatabase)) {
      if (key.includes(ingredient) || ingredient.includes(key)) {
        return res.json(substitutionDatabase[key]);
      }
    }
  }

  res.json(substitutions);
});

// ============================================
// 3. Meal Prep Cost Calculator Endpoints
// ============================================

router.get('/cost-breakdown', (req, res) => {
  const recipe = req.query.recipe;

  if (!recipe || !recipeCosts[recipe]) {
    return res.json({ breakdown: [], totalCost: 0, costPerServing: 0 });
  }

  const recipeData = recipeCosts[recipe];
  const totalCost = recipeData.breakdown.reduce((sum, item) => sum + item.totalCost, 0);
  const costPerServing = totalCost / recipeData.servings;

  res.json({
    breakdown: recipeData.breakdown,
    totalCost,
    costPerServing
  });
});

// ============================================
// 4. Nutrition Goal Tracker Endpoints
// ============================================

// In-memory storage for demo
let nutritionGoals = [
  { id: '1', nutrient: 'Protein', target: 150, current: 89, unit: 'g' },
  { id: '2', nutrient: 'Fiber', target: 30, current: 22, unit: 'g' },
  { id: '3', nutrient: 'Iron', target: 18, current: 12, unit: 'mg' },
  { id: '4', nutrient: 'Calcium', target: 1000, current: 650, unit: 'mg' },
  { id: '5', nutrient: 'Vitamin C', target: 90, current: 75, unit: 'mg' }
];

router.get('/nutrition-goals', (req, res) => {
  res.json(nutritionGoals);
});

router.post('/nutrition-goals', (req, res) => {
  const { nutrient, target, unit } = req.body;

  const newGoal = {
    id: `goal-${Date.now()}`,
    nutrient,
    target,
    current: 0,
    unit
  };

  nutritionGoals.push(newGoal);
  res.json(newGoal);
});

// Get recipe suggestions based on nutrition needs
router.get('/nutrition-suggestions', (req, res) => {
  // Would analyze goals and suggest recipes that help meet targets
  const suggestions = [
    { recipeName: 'Grilled Chicken Salad', helps: ['Protein', 'Iron'] },
    { recipeName: 'Lentil Soup', helps: ['Fiber', 'Iron'] },
    { recipeName: 'Greek Yogurt Parfait', helps: ['Protein', 'Calcium'] }
  ];
  res.json(suggestions);
});

// ============================================
// 5. Collaborative Meal Voting Endpoints
// ============================================

let mealVotes = [
  {
    mealId: '1',
    mealName: 'Taco Tuesday',
    votes: [
      { memberId: 'you', memberName: 'You', vote: 'yes' },
      { memberId: 'partner', memberName: 'Partner', vote: 'yes' }
    ],
    totalYes: 2,
    totalNo: 0
  },
  {
    mealId: '2',
    mealName: 'Spaghetti Night',
    votes: [
      { memberId: 'you', memberName: 'You', vote: 'yes' },
      { memberId: 'child1', memberName: 'Child 1', vote: 'yes' },
      { memberId: 'child2', memberName: 'Child 2', vote: 'no' }
    ],
    totalYes: 2,
    totalNo: 1
  },
  {
    mealId: '3',
    mealName: 'Vegetable Curry',
    votes: [
      { memberId: 'partner', memberName: 'Partner', vote: 'yes' },
      { memberId: 'child1', memberName: 'Child 1', vote: 'maybe' }
    ],
    totalYes: 1,
    totalNo: 0
  },
  {
    mealId: '4',
    mealName: 'Grilled Salmon',
    votes: [
      { memberId: 'you', memberName: 'You', vote: 'yes' },
      { memberId: 'partner', memberName: 'Partner', vote: 'yes' }
    ],
    totalYes: 2,
    totalNo: 0
  }
];

router.get('/meal-votes', (req, res) => {
  res.json(mealVotes);
});

router.post('/meal-votes', (req, res) => {
  const { mealId, vote, memberId } = req.body;

  const meal = mealVotes.find(m => m.mealId === mealId);
  if (meal) {
    // Remove existing vote from this member
    meal.votes = meal.votes.filter(v => v.memberId !== memberId);

    // Add new vote
    meal.votes.push({
      memberId,
      memberName: memberId === 'you' ? 'You' : memberId,
      vote
    });

    // Recalculate totals
    meal.totalYes = meal.votes.filter(v => v.vote === 'yes').length;
    meal.totalNo = meal.votes.filter(v => v.vote === 'no').length;
  }

  res.json({ success: true });
});

router.post('/meal-votes/add', (req, res) => {
  const { mealName } = req.body;

  const newMeal = {
    mealId: `meal-${Date.now()}`,
    mealName,
    votes: [],
    totalYes: 0,
    totalNo: 0
  };

  mealVotes.push(newMeal);
  res.json(newMeal);
});

// ============================================
// 6. Pantry Depletion Predictor Endpoints
// ============================================

let depletionPredictions = [
  {
    itemName: 'Milk',
    currentQuantity: 1.5,
    unit: 'liters',
    predictedDaysUntilEmpty: 3,
    avgDailyUsage: 0.5,
    suggestedReorderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    autoAddToList: true
  },
  {
    itemName: 'Bread',
    currentQuantity: 8,
    unit: 'slices',
    predictedDaysUntilEmpty: 2,
    avgDailyUsage: 4,
    suggestedReorderDate: new Date().toISOString(),
    autoAddToList: true
  },
  {
    itemName: 'Eggs',
    currentQuantity: 6,
    unit: 'pieces',
    predictedDaysUntilEmpty: 4,
    avgDailyUsage: 1.5,
    suggestedReorderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    autoAddToList: false
  },
  {
    itemName: 'Rice',
    currentQuantity: 500,
    unit: 'g',
    predictedDaysUntilEmpty: 10,
    avgDailyUsage: 50,
    suggestedReorderDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    autoAddToList: false
  },
  {
    itemName: 'Coffee',
    currentQuantity: 150,
    unit: 'g',
    predictedDaysUntilEmpty: 5,
    avgDailyUsage: 30,
    suggestedReorderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    autoAddToList: true
  },
  {
    itemName: 'Olive Oil',
    currentQuantity: 200,
    unit: 'ml',
    predictedDaysUntilEmpty: 14,
    avgDailyUsage: 14,
    suggestedReorderDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    autoAddToList: false
  }
];

router.get('/depletion-predictions', (req, res) => {
  // Sort by days until empty (most urgent first)
  const sorted = [...depletionPredictions].sort((a, b) =>
    a.predictedDaysUntilEmpty - b.predictedDaysUntilEmpty
  );
  res.json(sorted);
});

router.post('/depletion-auto-add', (req, res) => {
  const { itemName, autoAdd } = req.body;

  const item = depletionPredictions.find(p => p.itemName === itemName);
  if (item) {
    item.autoAddToList = autoAdd;
  }

  res.json({ success: true });
});

// Update depletion prediction when item is used
router.post('/depletion-update', (req, res) => {
  const { itemName, quantityUsed } = req.body;

  const item = depletionPredictions.find(p => p.itemName === itemName);
  if (item) {
    item.currentQuantity -= quantityUsed;
    // Recalculate prediction
    item.predictedDaysUntilEmpty = Math.floor(item.currentQuantity / item.avgDailyUsage);
    item.suggestedReorderDate = new Date(
      Date.now() + (item.predictedDaysUntilEmpty - 2) * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  res.json({ success: true });
});

module.exports = router;
