/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('posts', table => {
    table.integer('score').notNullable().defaultTo(0);
    table.integer('views').notNullable().defaultTo(0);
  });
  await knex.schema.alterTable('answers', table => {
    table.integer('score').notNullable().defaultTo(0);
  });

  await knex.raw(`
    UPDATE posts
    SET score = COALESCE((
      SELECT SUM(score)
      FROM post_votes
      WHERE post_votes."postId" = posts.id
    ), 0),
    views = COALESCE((
      SELECT COUNT(*)
      FROM post_views
      WHERE post_views."postId" = posts.id
    ), 0)
  `);

  await knex.raw(`
    UPDATE answers
    SET score = COALESCE((
      SELECT SUM(score)
      FROM answer_votes
      WHERE answer_votes."answerId" = answers.id
    ), 0)
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('score');
    table.dropColumn('views');
  });
  await knex.schema.alterTable('answers', table => {
    table.dropColumn('score');
  });
};
