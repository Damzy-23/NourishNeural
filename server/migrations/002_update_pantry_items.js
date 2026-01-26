exports.up = function (knex) {
    return knex.schema.table('pantry_items', function (table) {
        // Add missing columns if they don't exist
        // Note: Knex doesn't have native "if not exists" for columns easily, 
        // but running this on a schema that lacks them is the goal.

        // We check existence in a real scenario, but for this migration we assume they are missing 
        // based on the discrepancy between 001_initial_schema.js and the code.

        table.boolean('is_archived').defaultTo(false);
        table.decimal('actual_price', 10, 2).nullable();
        table.string('store_name').nullable();
        table.string('brand').nullable();
        table.string('image_url').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('pantry_items', function (table) {
        table.dropColumn('is_archived');
        table.dropColumn('actual_price');
        table.dropColumn('store_name');
        table.dropColumn('brand');
        table.dropColumn('image_url');
    });
};
