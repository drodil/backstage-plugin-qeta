/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.string('url').nullable();
  });

  await knex.schema.alterTable('user_stats', table => {
    table.integer('totalLinks').unsigned().defaultTo(0).notNullable();
  });

  await knex.schema.alterTable('global_stats', table => {
    table.integer('totalLinks').unsigned().defaultTo(0).notNullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('url');
  });

  await knex.schema.alterTable('user_stats', table => {
    table.dropColumn('totalLinks');
  });

  await knex.schema.alterTable('global_stats', table => {
    table.dropColumn('totalLinks');
  });
};
