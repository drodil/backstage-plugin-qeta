/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('collection_posts', table => {
    if (knex.client.config.client === 'pg') {
      table.increments('rank', { primaryKey: false });
    } else {
      table.integer('rank').defaultTo(0).notNullable();
    }
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('collection_posts', table => {
    table.dropColumn('rank');
  });
};
