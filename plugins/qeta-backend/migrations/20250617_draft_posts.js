/* eslint-disable func-names */

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.string('status').notNullable().defaultTo('active');
  });

  await knex('posts').update({ status: 'active' });

  await knex.schema.alterTable('posts', table => {
    table.index('status');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropIndex('status');
    table.dropColumn('status');
  });
};
