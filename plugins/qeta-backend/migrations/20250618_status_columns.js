/* eslint-disable func-names */

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('answers', table => {
    table.string('status').notNullable().defaultTo('active');
  });

  await knex('answers').update({ status: 'active' });

  await knex.schema.alterTable('answers', table => {
    table.index('status');
  });

  await knex.schema.alterTable('comments', table => {
    table.string('status').notNullable().defaultTo('active');
  });

  await knex('comments').update({ status: 'active' });

  await knex.schema.alterTable('comments', table => {
    table.index('status');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('answers', table => {
    table.dropIndex('status');
    table.dropColumn('status');
  });

  await knex.schema.alterTable('comments', table => {
    table.dropIndex('status');
    table.dropColumn('status');
  });
};
