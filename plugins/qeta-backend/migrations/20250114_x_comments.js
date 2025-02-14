/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // Combine comments to single table
  await knex.schema.createTable('comments', table => {
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.integer('postId').unsigned().nullable();
    table.integer('answerId').unsigned().nullable();
    table.increments('id');
    table
      .foreign('postId')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table
      .foreign('answerId')
      .references('id')
      .inTable('answers')
      .onDelete('CASCADE');
  });

  const postComments = await knex('post_comments').select();
  for (const comment of postComments) {
    await knex('comments').insert({
      ...comment,
      id: undefined,
    });
  }

  const answerComments = await knex('answer_comments').select();
  for (const comment of answerComments) {
    await knex('comments').insert({
      ...comment,
      id: undefined,
    });
  }

  await knex.schema.dropView('unique_authors');

  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('comments').select('author'),
        knex('post_views').select('author'),
      ]),
    );
  });

  await knex.schema.alterTable('post_comments', table => {
    table.dropForeign('postId', 'question_comments_questionid_foreign');
  });
  await knex.schema.alterTable('answer_comments', table => {
    table.dropForeign('answerId');
  });

  await knex.schema.dropTable('post_comments');
  await knex.schema.dropTable('answer_comments');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.createTable('post_comments', table => {
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.integer('postId').unsigned().notNullable();
    table.increments('id');
    table
      .foreign('postId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('answer_comments', table => {
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.integer('answerId').unsigned().notNullable();
    table.increments('id');
    table
      .foreign('answerId')
      .references('id')
      .inTable('answers')
      .onDelete('CASCADE');
  });

  const comments = await knex('comments').select();
  for (const comment of comments) {
    if (comment.postId) {
      await knex('post_comments').insert({
        ...comment,
        id: undefined,
      });
    } else {
      await knex('answer_comments').insert({
        ...comment,
        id: undefined,
      });
    }
  }

  await knex.schema.dropView('unique_authors');
  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('answer_comments').select('author'),
        knex('post_comments').select('author'),
        knex('post_views').select('author'),
      ]),
    );
  });

  await knex.schema.dropTable('comments');
};
