/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('collection_posts', table => {
    table.increments('rank', { primaryKey: false });
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
