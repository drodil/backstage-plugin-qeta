/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('post_tags', table => {
    table.index('tagId');
  });

  await knex.schema.alterTable('post_entities', table => {
    table.index('entityId');
  });

  await knex.schema.alterTable('posts', table => {
    table.index('score');
    table.index('views');
  });

  await knex.schema.alterTable('post_votes', table => {
    table.index('author');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('post_tags', table => {
    table.dropIndex('tagId');
  });

  await knex.schema.alterTable('post_entities', table => {
    table.dropIndex('entityId');
  });

  await knex.schema.alterTable('posts', table => {
    table.dropIndex('score');
    table.dropIndex('views');
  });

  await knex.schema.alterTable('post_votes', table => {
    table.dropIndex('author');
  });
};
