/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('post_links', table => {
    table
      .integer('postId')
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table
      .integer('linkedPostId')
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table
      .integer('viaAnswerId')
      .nullable()
      .references('id')
      .inTable('answers')
      .onDelete('CASCADE');
    table
      .integer('viaCommentId')
      .nullable()
      .references('id')
      .inTable('comments')
      .onDelete('CASCADE');

    table.unique(['postId', 'linkedPostId']);
    // Ensure we don't link to self
    table.check(
      '?? != ??',
      ['postId', 'linkedPostId'],
      'post_links_no_self_link',
    );
  });

  await knex.schema.createTable('post_followers', table => {
    table
      .integer('postId')
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table.string('user').notNullable();
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
    table.primary(['postId', 'user']);
  });

  // Backfill followers
  await knex.raw(`
    INSERT INTO post_followers ("postId", "user")
    SELECT id, author FROM posts
    UNION
    SELECT "postId", author FROM answers
    UNION
    SELECT "postId", author FROM comments WHERE "postId" IS NOT NULL
    UNION
    SELECT answers."postId", comments.author FROM comments JOIN answers ON comments."answerId" = answers.id WHERE "answerId" IS NOT NULL
    ON CONFLICT ("postId", "user") DO NOTHING
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('post_followers');
  await knex.schema.dropTable('post_links');
};
