/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('post_votes', table => {
    table.index('score');
    table.index(['postId', 'author']);
  });

  await knex.schema.alterTable('answers', table => {
    table.index('correct');
    table.index(['postId', 'correct']);
  });

  await knex.schema.alterTable('user_favorite', table => {
    table.index('user');
    table.index(['user', 'postId']);
  });

  await knex.schema.alterTable('post_views', table => {
    table.index('author');
    table.index(['postId', 'author']);
  });

  await knex.schema.alterTable('post_entities', table => {
    table.index(['postId', 'entityId']);
  });

  await knex.schema.alterTable('tag_experts', table => {
    table.index(['tagId', 'entityRef']);
  });

  await knex.schema.alterTable('comments', table => {
    table.index(['author', 'created']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('post_votes', table => {
    table.dropIndex('score');
    table.dropIndex(['postId', 'author']);
  });

  await knex.schema.alterTable('answers', table => {
    table.dropIndex('correct');
    table.dropIndex(['postId', 'correct']);
  });

  await knex.schema.alterTable('user_favorite', table => {
    table.dropIndex('user');
    table.dropIndex(['user', 'postId']);
  });

  await knex.schema.alterTable('post_views', table => {
    table.dropIndex('author');
    table.dropIndex(['postId', 'author']);
  });

  await knex.schema.alterTable('post_entities', table => {
    table.dropIndex(['postId', 'entityId']);
  });

  await knex.schema.alterTable('tag_experts', table => {
    table.dropIndex(['tagId', 'entityRef']);
  });

  await knex.schema.alterTable('comments', table => {
    table.dropIndex(['author', 'created']);
  });
};
