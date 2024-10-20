/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.string('headerImage').nullable();
  });

  await knex.schema.alterTable('user_stats', table => {
    table.integer('totalArticles').unsigned().defaultTo(0).notNullable();
  });

  await knex.schema.alterTable('global_stats', table => {
    table.integer('totalArticles').unsigned().defaultTo(0).notNullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('headerImage');
  });

  await knex.schema.alterTable('user_stats', table => {
    table.dropColumn('totalArticles');
  });

  await knex.schema.alterTable('global_stats', table => {
    table.dropColumn('totalArticles');
  });
};
