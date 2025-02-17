/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.index('created');
  });
  await knex.schema.alterTable('answers', table => {
    table.index('postId');
    table.index('created');
  });
  await knex.schema.alterTable('collections', table => {
    table.index('created');
  });
  await knex.schema.alterTable('attachments', table => {
    table.index('postId');
    table.index('answerId');
    table.index('collectionId');
  });
  await knex.schema.alterTable('comments', table => {
    table.index('postId');
    table.index('answerId');
    table.index('created');
  });
  await knex.schema.alterTable('post_views', table => {
    table.index('postId');
  });
  await knex.schema.alterTable('post_ai_answers', table => {
    table.index('postId');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropIndex('created');
  });
  await knex.schema.alterTable('answers', table => {
    table.dropIndex('postId');
    table.dropIndex('created');
  });
  await knex.schema.alterTable('collections', table => {
    table.dropIndex('created');
  });
  await knex.schema.alterTable('attachments', table => {
    table.dropIndex('postId');
    table.dropIndex('answerId');
    table.dropIndex('collectionId');
  });
  await knex.schema.alterTable('comments', table => {
    table.dropIndex('postId');
    table.dropIndex('answerId');
    table.dropIndex('created');
  });
  await knex.schema.alterTable('post_views', table => {
    table.dropIndex('postId');
  });
  await knex.schema.alterTable('post_ai_answers', table => {
    table.dropIndex('postId');
  });
};
