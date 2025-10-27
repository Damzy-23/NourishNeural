exports.seed = async function(knex) {
  // Clear existing data
  await knex('recipe_instructions').del()
  await knex('recipe_ingredients').del()
  await knex('recipes').del()
  await knex('pantry_items').del()
  await knex('grocery_items').del()
  await knex('grocery_lists').del()
  await knex('store_features').del()
  await knex('store_opening_hours').del()
  await knex('stores').del()
  await knex('user_preferences').del()
  await knex('users').del()

  // Insert sample users
  const [user] = await knex('users').insert([
    {
      google_id: 'sample_google_id_123',
      email: 'demo@pantrypal.app',
      first_name: 'Demo',
      last_name: 'User',
      avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=22c55e&color=fff',
      is_verified: true,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*')

  // Insert user preferences
  await knex('user_preferences').insert([
    {
      user_id: user.id,
      dietary_restrictions: ['vegetarian'],
      budget_limit: 80.00,
      household_size: 2,
      preferred_stores: ['Tesco', 'Sainsbury\'s'],
      created_at: new Date(),
      updated_at: new Date()
    }
  ])

  // Insert sample stores
  const stores = await knex('stores').insert([
    {
      name: 'Tesco Extra',
      chain: 'Tesco',
      address: '123 High Street, London, SW1A 1AA',
      latitude: 51.5074,
      longitude: -0.1278,
      phone: '020 7123 4567',
      website: 'https://www.tesco.com',
      loyalty_program: 'Clubcard',
      delivery_available: true,
      click_and_collect: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Sainsbury\'s Local',
      chain: 'Sainsbury\'s',
      address: '456 Oxford Street, London, W1C 1AP',
      latitude: 51.5154,
      longitude: -0.1419,
      phone: '020 7123 4568',
      website: 'https://www.sainsburys.co.uk',
      loyalty_program: 'Nectar',
      delivery_available: true,
      click_and_collect: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Aldi',
      chain: 'Aldi',
      address: '789 Camden High Street, London, NW1 7NL',
      latitude: 51.5392,
      longitude: -0.1426,
      phone: '020 7123 4569',
      website: 'https://www.aldi.co.uk',
      loyalty_program: null,
      delivery_available: false,
      click_and_collect: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*')

  // Insert store opening hours
  const days = [
    { day_order: 0, day_name: 'Sunday', open_time: '10:00', close_time: '16:00' },
    { day_order: 1, day_name: 'Monday', open_time: '07:00', close_time: '22:00' },
    { day_order: 2, day_name: 'Tuesday', open_time: '07:00', close_time: '22:00' },
    { day_order: 3, day_name: 'Wednesday', open_time: '07:00', close_time: '22:00' },
    { day_order: 4, day_name: 'Thursday', open_time: '07:00', close_time: '22:00' },
    { day_order: 5, day_name: 'Friday', open_time: '07:00', close_time: '22:00' },
    { day_order: 6, day_name: 'Saturday', open_time: '07:00', close_time: '22:00' }
  ]

  for (const store of stores) {
    for (const day of days) {
      await knex('store_opening_hours').insert({
        store_id: store.id,
        ...day,
        created_at: new Date(),
        updated_at: new Date()
      })
    }
  }

  // Insert store features
  for (const store of stores) {
    await knex('store_features').insert([
      {
        store_id: store.id,
        feature_name: 'parking',
        feature_value: 'free',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        store_id: store.id,
        feature_name: 'wheelchair_access',
        feature_value: 'true',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        store_id: store.id,
        feature_name: 'atm',
        feature_value: 'true',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  }

  // Insert sample grocery list
  const [groceryList] = await knex('grocery_lists').insert([
    {
      name: 'Weekly Shopping',
      user_id: user.id,
      store_id: stores[0].id, // Tesco
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*')

  // Insert grocery items
  await knex('grocery_items').insert([
    {
      list_id: groceryList.id,
      name: 'Milk',
      quantity: 2,
      unit: 'litres',
      category: 'Dairy',
      estimated_price: 2.50,
      is_checked: false,
      created_at: new Date()
    },
    {
      list_id: groceryList.id,
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      category: 'Bakery',
      estimated_price: 1.20,
      is_checked: false,
      created_at: new Date()
    },
    {
      list_id: groceryList.id,
      name: 'Bananas',
      quantity: 6,
      unit: 'pieces',
      category: 'Fruits',
      estimated_price: 1.50,
      is_checked: true,
      created_at: new Date()
    },
    {
      list_id: groceryList.id,
      name: 'Chicken Breast',
      quantity: 500,
      unit: 'grams',
      category: 'Meat',
      estimated_price: 4.50,
      is_checked: false,
      created_at: new Date()
    }
  ])

  // Insert sample pantry items
  await knex('pantry_items').insert([
    {
      user_id: user.id,
      name: 'Rice',
      quantity: 2,
      unit: 'kg',
      category: 'Grains',
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      purchase_date: new Date(),
      estimated_price: 3.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: user.id,
      name: 'Olive Oil',
      quantity: 1,
      unit: 'litre',
      category: 'Oils',
      expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      purchase_date: new Date(),
      estimated_price: 4.50,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: user.id,
      name: 'Canned Tomatoes',
      quantity: 4,
      unit: 'cans',
      category: 'Canned Goods',
      expiry_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years from now
      purchase_date: new Date(),
      estimated_price: 2.00,
      created_at: new Date(),
      updated_at: new Date()
    }
  ])

  // Insert sample recipe
  const [recipe] = await knex('recipes').insert([
    {
      name: 'Simple Pasta Carbonara',
      description: 'A classic Italian pasta dish with eggs, cheese, and pancetta',
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Italian',
      tags: ['pasta', 'quick', 'dinner'],
      nutrition_per_serving: {
        calories: 650,
        protein: 25,
        carbs: 70,
        fat: 30
      },
      user_id: user.id,
      is_public: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*')

  // Insert recipe ingredients
  await knex('recipe_ingredients').insert([
    {
      recipe_id: recipe.id,
      name: 'Spaghetti',
      quantity: 400,
      unit: 'grams',
      notes: 'or any long pasta'
    },
    {
      recipe_id: recipe.id,
      name: 'Eggs',
      quantity: 4,
      unit: 'large',
      notes: 'room temperature'
    },
    {
      recipe_id: recipe.id,
      name: 'Pancetta',
      quantity: 150,
      unit: 'grams',
      notes: 'or guanciale if available'
    },
    {
      recipe_id: recipe.id,
      name: 'Parmesan Cheese',
      quantity: 100,
      unit: 'grams',
      notes: 'freshly grated'
    }
  ])

  // Insert recipe instructions
  await knex('recipe_instructions').insert([
    {
      recipe_id: recipe.id,
      step_order: 1,
      instruction: 'Bring a large pot of salted water to boil and cook spaghetti according to package directions.'
    },
    {
      recipe_id: recipe.id,
      step_order: 2,
      instruction: 'Meanwhile, cook pancetta in a large skillet over medium heat until crispy, about 8 minutes.'
    },
    {
      recipe_id: recipe.id,
      step_order: 3,
      instruction: 'In a bowl, whisk together eggs and grated cheese. Season with black pepper.'
    },
    {
      recipe_id: recipe.id,
      step_order: 4,
      instruction: 'Drain pasta, reserving 1 cup of pasta water. Add hot pasta to skillet with pancetta.'
    },
    {
      recipe_id: recipe.id,
      step_order: 5,
      instruction: 'Remove from heat and quickly stir in egg mixture, adding pasta water as needed for a creamy sauce.'
    }
  ])

  console.log('✅ Sample data seeded successfully!')
} 