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
      substitute: 'Golden Syrup',
      ratio: '1:1 replacement',
      notes: 'Common UK substitute. Thick and sweet.',
      quality: 'excellent'
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
      substitute: 'Creme Fraiche',
      ratio: '1:1 replacement',
      notes: 'Higher fat content, less tangy. Good for heating.',
      quality: 'excellent'
    }
  ],
  'self-raising flour': [
    {
      original: 'Self-Raising Flour',
      substitute: 'Plain Flour + Baking Powder',
      ratio: '1 cup flour + 1.5 tsp baking powder + 1/4 tsp salt',
      notes: 'Standard homemade substitute.',
      quality: 'excellent'
    }
  ],
  'breadcrumbs': [
    {
      original: 'Breadcrumbs',
      substitute: 'Crushed Cornflakes',
      ratio: '1:1 replacement',
      notes: 'Crunchier texture. Great for frying.',
      quality: 'excellent'
    },
    {
      original: 'Breadcrumbs',
      substitute: 'Oats',
      ratio: '1:1 replacement',
      notes: 'Pulse in blender for finer texture. Healthier option.',
      quality: 'good'
    }
  ],
  'cornstarch': [
    {
      original: 'Cornstarch',
      substitute: 'Plain Flour',
      ratio: '1 tbsp cornstarch = 2 tbsp flour',
      notes: 'Need to cook longer to remove raw flour taste.',
      quality: 'good'
    },
    {
      original: 'Cornstarch',
      substitute: 'Arrowroot Powder',
      ratio: '1:1 replacement',
      notes: 'Clear gel, gluten-free. Freezes well.',
      quality: 'excellent'
    }
  ]
};

// Mock recipe cost data (GBP & UK Stores)
const recipeCosts = {
  'spaghetti-bolognese': {
    breakdown: [
      { ingredient: 'Spaghetti', quantity: '500g', pricePerUnit: 0.95, totalCost: 0.95, store: 'Tesco' },
      { ingredient: 'Beef Mince', quantity: '500g', pricePerUnit: 3.50, totalCost: 3.50, store: 'Aldi' },
      { ingredient: 'Tomato Sauce', quantity: '500g', pricePerUnit: 0.85, totalCost: 0.85, store: 'Sainsbury\'s' },
      { ingredient: 'Onion', quantity: '1 medium', pricePerUnit: 0.20, totalCost: 0.20, store: 'Tesco' },
      { ingredient: 'Garlic', quantity: '1 bulb', pricePerUnit: 0.60, totalCost: 0.20, store: 'Tesco' },
      { ingredient: 'Olive Oil', quantity: '2 tbsp', pricePerUnit: 3.50, totalCost: 0.30, store: 'Waitrose' },
      { ingredient: 'Parmesan', quantity: '50g', pricePerUnit: 3.00, totalCost: 1.50, store: 'Waitrose' }
    ],
    servings: 4
  },
  'chicken-stir-fry': {
    breakdown: [
      { ingredient: 'Chicken Breast', quantity: '400g', pricePerUnit: 4.50, totalCost: 4.50, store: 'Tesco' },
      { ingredient: 'Stir Fry Veg Mix', quantity: '320g', pricePerUnit: 1.50, totalCost: 1.50, store: 'Aldi' },
      { ingredient: 'Soy Sauce', quantity: '3 tbsp', pricePerUnit: 1.20, totalCost: 0.30, store: 'Tesco' },
      { ingredient: 'Ginger', quantity: '1 piece', pricePerUnit: 0.40, totalCost: 0.20, store: 'Sainsbury\'s' },
      { ingredient: 'Noodles', quantity: '300g', pricePerUnit: 1.10, totalCost: 1.10, store: 'Tesco' },
      { ingredient: 'Sesame Oil', quantity: '1 tbsp', pricePerUnit: 2.00, totalCost: 0.40, store: 'Waitrose' }
    ],
    servings: 3
  },
  'vegetable-curry': {
    breakdown: [
      { ingredient: 'Chickpeas', quantity: '400g tin', pricePerUnit: 0.49, totalCost: 0.49, store: 'Aldi' },
      { ingredient: 'Coconut Milk', quantity: '400ml', pricePerUnit: 0.85, totalCost: 0.85, store: 'Tesco' },
      { ingredient: 'Curry Paste', quantity: '2 tbsp', pricePerUnit: 1.80, totalCost: 0.60, store: 'Sainsbury\'s' },
      { ingredient: 'Sweet Potato', quantity: '500g', pricePerUnit: 1.10, totalCost: 1.10, store: 'Tesco' },
      { ingredient: 'Spinach', quantity: '200g', pricePerUnit: 1.50, totalCost: 1.50, store: 'Waitrose' },
      { ingredient: 'Basmati Rice', quantity: '250g', pricePerUnit: 1.40, totalCost: 0.70, store: 'Aldi' }
    ],
    servings: 4
  },
  'grilled-salmon': {
    breakdown: [
      { ingredient: 'Salmon Fillet', quantity: '2x 150g', pricePerUnit: 4.50, totalCost: 9.00, store: 'Waitrose' },
      { ingredient: 'Asparagus', quantity: '200g', pricePerUnit: 2.00, totalCost: 2.00, store: 'Sainsbury\'s' },
      { ingredient: 'New Potatoes', quantity: '400g', pricePerUnit: 1.20, totalCost: 1.20, store: 'Tesco' },
      { ingredient: 'Lemon', quantity: '1 whole', pricePerUnit: 0.35, totalCost: 0.35, store: 'Aldi' },
      { ingredient: 'Dill', quantity: '10g', pricePerUnit: 0.70, totalCost: 0.70, store: 'Sainsbury\'s' }
    ],
    servings: 2
  },
  'sunday-roast': {
    breakdown: [
      { ingredient: 'Whole Chicken', quantity: '1.5kg', pricePerUnit: 4.50, totalCost: 4.50, store: 'Aldi' },
      { ingredient: 'Roast Potatoes', quantity: '1kg', pricePerUnit: 1.29, totalCost: 1.29, store: 'Tesco' },
      { ingredient: 'Carrots', quantity: '500g', pricePerUnit: 0.45, totalCost: 0.45, store: 'Tesco' },
      { ingredient: 'Broccoli', quantity: '1 head', pricePerUnit: 0.69, totalCost: 0.69, store: 'Aldi' },
      { ingredient: 'Yorkshire Puddings', quantity: '6 pack', pricePerUnit: 1.10, totalCost: 1.10, store: 'Waitrose' },
      { ingredient: 'Gravy Granules', quantity: '4 tbsp', pricePerUnit: 1.50, totalCost: 0.20, store: 'Sainsbury\'s' }
    ],
    servings: 4
  }
};

// ============================================
// 1. Smart Leftover Recipe Matcher Endpoints
// ============================================

// Get items nearing expiration
router.get('/expiring-items', (req, res) => {
  const expiringItems = [
    { id: '1', name: 'Chicken Breast', quantity: 2, unit: 'pack', expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 1 },
    { id: '2', name: 'Spinach', quantity: 1, unit: 'bag', expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 2 },
    { id: '3', name: 'Greek Yogurt', quantity: 300, unit: 'g', expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 3 },
    { id: '4', name: 'Bell Peppers', quantity: 3, unit: 'pcs', expiryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 4 },
    { id: '5', name: 'Mushrooms', quantity: 250, unit: 'g', expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 2 },
    { id: '6', name: 'Double Cream', quantity: 150, unit: 'ml', expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 1 },
    { id: '7', name: 'Cheddar Cheese', quantity: 200, unit: 'g', expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 5 },
    { id: '8', name: 'Bread', quantity: 4, unit: 'slices', expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 1 }
  ];
  res.json(expiringItems);
});

// Get recipes that use expiring ingredients
router.get('/leftover-recipes', (req, res) => {
  const recipes = [
    {
      id: '1',
      name: 'Creamy Mushroom & Spinach Chicken',
      matchingIngredients: ['Chicken Breast', 'Spinach', 'Mushrooms', 'Double Cream'],
      missingIngredients: ['Garlic', 'Onion'],
      matchScore: 92,
      prepTime: 25,
      servings: 4,
      imageUrl: null,
      extendedIngredients: [
        '500g Chicken Breast, diced',
        '200g Fresh Spinach',
        '250g Mushrooms, sliced',
        '150ml Double Cream',
        '2 cloves Garlic, minced',
        '1 Onion, chopped',
        '1 tbsp Olive Oil',
        'Salt and Pepper to taste'
      ],
      instructions: [
        'Heat olive oil in a large pan over medium heat.',
        'Add diced chicken and cook until golden brown and cooked through.',
        'Remove chicken and set aside.',
        'In the same pan, sauté onion and garlic until fragrant.',
        'Add mushrooms and cook until soft.',
        'Pour in double cream and simmer for 5 minutes.',
        'Stir in spinach and cook until wilted.',
        'Return chicken to the pan, heat through, and season with salt and pepper.',
        'Serve with rice or pasta.'
      ]
    },
    {
      id: '2',
      name: 'Chicken & Pepper Stir Fry',
      matchingIngredients: ['Chicken Breast', 'Bell Peppers', 'Mushrooms'],
      missingIngredients: ['Soy Sauce', 'Ginger', 'Noodles'],
      matchScore: 85,
      prepTime: 20,
      servings: 3,
      imageUrl: null,
      extendedIngredients: [
        '400g Chicken Breast, strips',
        '2 Bell Peppers, sliced',
        '150g Mushrooms, sliced',
        '3 tbsp Soy Sauce',
        '1 inch Ginger, grated',
        '300g Noodles',
        '1 tbsp Vegetable Oil'
      ],
      instructions: [
        'Cook noodles according to package instructions.',
        'Heat oil in a wok or large frying pan.',
        'Stir fry chicken strips until browned.',
        'Add peppers and mushrooms, stir fry for 3-4 minutes.',
        'Add ginger and soy sauce, toss to coat.',
        'Add cooked noodles and toss everything together.',
        'Serve hot immediately.'
      ]
    },
    {
      id: '3',
      name: 'Cheesy Vegetable Omelette',
      matchingIngredients: ['Spinach', 'Mushrooms', 'Bell Peppers', 'Cheddar Cheese'],
      missingIngredients: ['Eggs'],
      matchScore: 80,
      prepTime: 15,
      servings: 2,
      imageUrl: null,
      extendedIngredients: [
        '4 Eggs, beaten',
        '50g Cheddar Cheese, grated',
        'Handful of Spinach',
        '4-5 Mushrooms, sliced',
        '1/2 Bell Pepper, diced',
        '1 tsp Butter'
      ],
      instructions: [
        'Melt butter in a non-stick frying pan.',
        'Sauté mushrooms and peppers until soft.',
        'Add spinach and cook until wilted.',
        'Pour in eggs and swirl to cover the pan.',
        'Sprinkle cheese over the top.',
        'Cook until eggs are set and cheese is melted.',
        'Fold over and serve.'
      ]
    },
    {
      id: '4',
      name: 'Greek Yogurt Chicken Marinade',
      matchingIngredients: ['Chicken Breast', 'Greek Yogurt'],
      missingIngredients: ['Lemon', 'Garlic', 'Oregano'],
      matchScore: 70,
      prepTime: 10,
      servings: 4,
      imageUrl: null,
      extendedIngredients: [
        '4 Chicken Breasts',
        '1 cup Greek Yogurt',
        '1 Lemon, juiced',
        '3 cloves Garlic, minced',
        '2 tbsp Oregano',
        'Salt and Pepper'
      ],
      instructions: [
        'Mix yogurt, lemon juice, garlic, oregano, salt, and pepper in a bowl.',
        'Coat chicken breasts thoroughly with the marinade.',
        'Marinate for at least 30 minutes, or overnight in the fridge.',
        'Grill or bake chicken until cooked through.',
        'Serve with salad or roasted vegetables.'
      ]
    },
    {
      id: '5',
      name: 'Creamy Mushroom Pasta',
      matchingIngredients: ['Mushrooms', 'Spinach', 'Double Cream', 'Cheddar Cheese'],
      missingIngredients: ['Pasta', 'Garlic'],
      matchScore: 88,
      prepTime: 20,
      servings: 2,
      imageUrl: null,
      extendedIngredients: [
        '250g Pasta (Penne or Fusilli)',
        '250g Mushrooms, sliced',
        '100g Spinach',
        '150ml Double Cream',
        '50g Cheddar Cheese',
        '2 cloves Garlic, minced',
        '1 tbsp Butter'
      ],
      instructions: [
        'Boil pasta in salted water until al dente.',
        'While pasta cooks, melt butter in a pan.',
        'Sauté garlic and mushrooms until browned.',
        'Add cream and cheese, stir until smooth.',
        'Add spinach and cook until wilted.',
        'Drain pasta and toss with the sauce.',
        'Serve with extra cheese if desired.'
      ]
    },
    {
      id: '6',
      name: 'Stuffed Peppers',
      matchingIngredients: ['Bell Peppers', 'Spinach', 'Available Cheese'],
      missingIngredients: ['Rice', 'Ground Beef', 'Onion'],
      matchScore: 65,
      prepTime: 45,
      servings: 3,
      imageUrl: null,
      extendedIngredients: [
        '3 Large Bell Peppers, halved',
        '250g Ground Beef (or alternative)',
        '1 cup Cooked Rice',
        '1 Onion, diced',
        'Handful of Spinach',
        '100g Cheese, grated',
        '1 can Tomatoes'
      ],
      instructions: [
        'Preheat oven to 180°C (350°F).',
        'Brown the beef and onion in a pan.',
        'Stir in cooked rice, spinach, and tomatoes.',
        'Fill pepper halves with the mixture.',
        'Top with grated cheese.',
        'Bake for 25-30 minutes until peppers are tender.',
        'Serve hot.'
      ]
    },
    {
      id: '7',
      name: 'Bread & Butter Pudding',
      matchingIngredients: ['Bread', 'Double Cream'],
      missingIngredients: ['Eggs', 'Milk', 'Sugar', 'Butter', 'Raisins'],
      matchScore: 60,
      prepTime: 50,
      servings: 4,
      imageUrl: null,
      extendedIngredients: [
        '8 slices Bread, buttered',
        '50g Raisins',
        '300ml Milk',
        '100ml Double Cream',
        '2 Eggs',
        '25g Sugar',
        'Nutmeg or Cinnamon'
      ],
      instructions: [
        'Grease a baking dish.',
        'Cut bread into triangles and layer in the dish with raisins.',
        'Whisk milk, cream, eggs, sugar, and spices together.',
        'Pour over the bread and let soak for 30 minutes.',
        'Bake at 180°C (350°F) for 30-40 minutes until golden and set.',
        'Serve warm.'
      ]
    },
    {
      id: '8',
      name: 'Cheat\'s Pizza Toast',
      matchingIngredients: ['Bread', 'Cheddar Cheese', 'Bell Peppers', 'Mushrooms'],
      missingIngredients: ['Tomato Puree'],
      matchScore: 95,
      prepTime: 10,
      servings: 1,
      imageUrl: null,
      extendedIngredients: [
        '2 slices Bread',
        '2 tbsp Tomato Puree (or Ketchup)',
        'Handful Cheddar Cheese, grated',
        'Peppers and Mushrooms, sliced',
        'Dried Oregano'
      ],
      instructions: [
        'Toast the bread lightly.',
        'Spread with tomato puree.',
        'Top with cheese, peppers, and mushrooms.',
        'Sprinkle with oregano.',
        'Grill (Broil) until cheese is bubbly and golden.',
        'Allow to cool slightly before eating.'
      ]
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

  // Search for updated substitutions
  const substitutions = substitutionDatabase[ingredient] || [];

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
