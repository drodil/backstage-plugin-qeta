/* eslint-disable func-names */

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.datetime('published').nullable();
  });

  // Set published date for all existing active posts to their created date
  await knex('posts')
    .where('status', 'active')
    .update({ published: knex.ref('created') });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('published');
  });
};
