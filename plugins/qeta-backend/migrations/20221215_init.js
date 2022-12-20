/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('questions', table => {
    table.string('author').notNullable();
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.primary(['id']);
    table.bigIncrements('id');
    table.index('author');
  });

  await knex.schema.createTable('answers', table => {
    table.bigint('questionId').unsigned().notNullable();
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.boolean('correct').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.primary(['id']);
    table.bigIncrements('id');
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.index('author');
  });

  await knex.schema.createTable('question_votes', table => {
    table.bigint('questionId').unsigned().notNullable();
    table.string('author').notNullable();
    table.smallint('score').notNullable();
    table.datetime('timestamp').notNullable();
    table.primary(['questionId', 'author']);
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('question_views', table => {
    table.bigint('questionId').unsigned().notNullable();
    table.string('author').notNullable();
    table.datetime('timestamp').notNullable();
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('answer_votes', table => {
    table.bigint('answerId').unsigned().notNullable();
    table.string('author').notNullable();
    table.smallint('score').notNullable();
    table.datetime('timestamp').notNullable();
    table.primary(['answerId', 'author']);
    table
      .foreign('answerId')
      .references('id')
      .inTable('answers')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('tags', table => {
    table.string('tag').notNullable();
    table.primary(['id']);
    table.unique(['tag']);
    table.bigIncrements('id');
  });

  await knex.schema.createTable('question_tags', table => {
    table.bigint('questionId').unsigned().notNullable();
    table.bigint('tagId').notNullable();
    table.primary(['questionId', 'tagId']);
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('questions');
  await knex.schema.dropTable('answers');
  await knex.schema.dropTable('question_votes');
  await knex.schema.dropTable('answer_votes');
  await knex.schema.dropTable('tags');
  await knex.schema.dropTable('question_tags');
};
