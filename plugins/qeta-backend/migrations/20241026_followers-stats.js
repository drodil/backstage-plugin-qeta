/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('user_stats', table => {
    table.integer('totalFollowers').unsigned().defaultTo(0).notNullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('user_stats', table => {
    table.dropColumn('totalFollowers');
  });
};
