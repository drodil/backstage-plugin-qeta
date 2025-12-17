/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.integer('answersCount').notNullable().defaultTo(0);
    table.integer('correctAnswers').notNullable().defaultTo(0);
    table.integer('commentsCount').notNullable().defaultTo(0);
    table.integer('favoritesCount').notNullable().defaultTo(0);
  });

  await knex.raw(`
    UPDATE posts
    SET "answersCount" = COALESCE((
      SELECT COUNT(*)
      FROM answers
      WHERE answers."postId" = posts.id AND answers.status = 'active'
    ), 0),
    "correctAnswers" = COALESCE((
      SELECT COUNT(*)
      FROM answers
      WHERE answers."postId" = posts.id AND answers.correct = true AND answers.status = 'active'
    ), 0),
    "commentsCount" = COALESCE((
      SELECT COUNT(*)
      FROM comments
      WHERE comments."postId" = posts.id AND comments.status = 'active'
    ), 0),
    "favoritesCount" = COALESCE((
      SELECT COUNT(*)
      FROM user_favorite
      WHERE user_favorite."postId" = posts.id
    ), 0)
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('answersCount');
    table.dropColumn('correctAnswers');
    table.dropColumn('commentsCount');
    table.dropColumn('favoritesCount');
  });
};
