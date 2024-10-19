/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.renameTable('questions', 'posts');
  await knex.schema.alterTable('posts', table => {
    table.string('type', 16).notNullable().defaultTo('question');
  });
  await knex.schema.alterTable('answers', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.alterTable('user_favorite', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.alterTable('attachments', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.renameTable('question_comments', 'post_comments');
  await knex.schema.alterTable('post_comments', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.renameTable('question_entities', 'post_entities');
  await knex.schema.alterTable('post_entities', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.renameTable('question_tags', 'post_tags');
  await knex.schema.alterTable('post_tags', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.renameTable('question_votes', 'post_votes');
  await knex.schema.alterTable('post_votes', table => {
    table.renameColumn('questionId', 'postId');
  });
  await knex.schema.renameTable('question_views', 'post_views');
  await knex.schema.alterTable('post_views', table => {
    table.renameColumn('questionId', 'postId');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.renameTable('posts', 'questions');
  await knex.schema.alterTable('questions', table => {
    table.dropColumn('type');
  });
  await knex.schema.alterTable('answers', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.alterTable('user_favorite', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.alterTable('attachments', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.renameTable('post_comments', 'question_comments');
  await knex.schema.alterTable('question_comments', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.renameTable('post_entities', 'question_entities');
  await knex.schema.alterTable('question_entities', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.renameTable('post_tags', 'question_tags');
  await knex.schema.alterTable('question_tags', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.renameTable('post_votes', 'question_votes');
  await knex.schema.alterTable('question_votes', table => {
    table.renameColumn('postId', 'questionId');
  });
  await knex.schema.renameTable('post_views', 'question_views');
  await knex.schema.alterTable('question_views', table => {
    table.renameColumn('postId', 'questionId');
  });
};
