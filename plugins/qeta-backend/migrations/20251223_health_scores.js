/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('post_reviews', table => {
    table.increments('id');
    table
      .integer('post_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table.string('reviewer').notNullable();
    table.string('status').notNullable(); // 'valid', 'obsolete'
    table.text('comment').nullable();
    table.dateTime('created').defaultTo(knex.fn.now()).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('post_reviews');
};
