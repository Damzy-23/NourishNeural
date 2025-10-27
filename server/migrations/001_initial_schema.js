exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('google_id').unique();
      table.string('email').notNullable().unique();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('avatar_url');
      table.boolean('is_verified').defaultTo(false);
      table.string('role').defaultTo('user');
      table.timestamps(true, true);
      
      // Indexes
      table.index('google_id');
      table.index('email');
    })
    
    // User preferences table
    .createTable('user_preferences', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.json('dietary_restrictions').defaultTo('[]');
      table.decimal('budget_limit', 8, 2).defaultTo(100.00);
      table.integer('household_size').defaultTo(1);
      table.json('preferred_stores').defaultTo('[]');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Indexes
      table.index('user_id');
    })
    
    // Stores table
    .createTable('stores', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('chain').notNullable();
      table.text('address').notNullable();
      table.decimal('latitude', 10, 8).notNullable();
      table.decimal('longitude', 11, 8).notNullable();
      table.string('phone');
      table.string('website');
      table.string('loyalty_program');
      table.boolean('delivery_available').defaultTo(false);
      table.boolean('click_and_collect').defaultTo(false);
      table.timestamps(true, true);
      
      // Indexes
      table.index('chain');
      table.index(['latitude', 'longitude']);
      table.index('loyalty_program');
    })
    
    // Store opening hours table
    .createTable('store_opening_hours', function(table) {
      table.increments('id').primary();
      table.integer('store_id').unsigned().notNullable();
      table.integer('day_order').notNullable(); // 0=Sunday, 1=Monday, etc.
      table.string('day_name').notNullable();
      table.time('open_time');
      table.time('close_time');
      table.boolean('closed').defaultTo(false);
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('store_id').references('id').inTable('stores').onDelete('CASCADE');
      
      // Indexes
      table.index('store_id');
      table.index('day_order');
    })
    
    // Store features table
    .createTable('store_features', function(table) {
      table.increments('id').primary();
      table.integer('store_id').unsigned().notNullable();
      table.string('feature_name').notNullable();
      table.string('feature_value');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('store_id').references('id').inTable('stores').onDelete('CASCADE');
      
      // Indexes
      table.index('store_id');
      table.index('feature_name');
    })
    
    // Grocery lists table
    .createTable('grocery_lists', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.integer('store_id').unsigned();
      table.string('status').defaultTo('active'); // active, completed, archived
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('store_id').references('id').inTable('stores').onDelete('SET NULL');
      
      // Indexes
      table.index('user_id');
      table.index('store_id');
      table.index('status');
    })
    
    // Grocery items table
    .createTable('grocery_items', function(table) {
      table.increments('id').primary();
      table.integer('list_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.decimal('quantity', 8, 2).notNullable();
      table.string('unit').notNullable();
      table.string('category').defaultTo('General');
      table.decimal('estimated_price', 8, 2);
      table.boolean('is_checked').defaultTo(false);
      table.text('notes');
      table.string('barcode');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('list_id').references('id').inTable('grocery_lists').onDelete('CASCADE');
      
      // Indexes
      table.index('list_id');
      table.index('category');
      table.index('barcode');
      table.index('is_checked');
    })
    
    // Pantry items table
    .createTable('pantry_items', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.decimal('quantity', 8, 2).notNullable();
      table.string('unit').notNullable();
      table.string('category').defaultTo('General');
      table.date('expiry_date');
      table.date('purchase_date').notNullable();
      table.decimal('estimated_price', 8, 2);
      table.string('barcode');
      table.text('notes');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Indexes
      table.index('user_id');
      table.index('category');
      table.index('barcode');
      table.index('expiry_date');
      table.index('purchase_date');
    })
    
    // Recipes table
    .createTable('recipes', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.integer('prep_time'); // in minutes
      table.integer('cook_time'); // in minutes
      table.integer('servings');
      table.string('difficulty'); // easy, medium, hard
      table.string('cuisine');
      table.json('tags').defaultTo('[]');
      table.json('nutrition_per_serving');
      table.integer('user_id').unsigned();
      table.boolean('is_public').defaultTo(false);
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
      
      // Indexes
      table.index('user_id');
      table.index('cuisine');
      table.index('difficulty');
      table.index('is_public');
    })
    
    // Recipe ingredients table
    .createTable('recipe_ingredients', function(table) {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.decimal('quantity', 8, 2).notNullable();
      table.string('unit').notNullable();
      table.text('notes');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
      
      // Indexes
      table.index('recipe_id');
    })
    
    // Recipe instructions table
    .createTable('recipe_instructions', function(table) {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable();
      table.integer('step_order').notNullable();
      table.text('instruction').notNullable();
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
      
      // Indexes
      table.index('recipe_id');
      table.index('step_order');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('recipe_instructions')
    .dropTableIfExists('recipe_ingredients')
    .dropTableIfExists('recipes')
    .dropTableIfExists('pantry_items')
    .dropTableIfExists('grocery_items')
    .dropTableIfExists('grocery_lists')
    .dropTableIfExists('store_features')
    .dropTableIfExists('store_opening_hours')
    .dropTableIfExists('stores')
    .dropTableIfExists('user_preferences')
    .dropTableIfExists('users');
}; 