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
    table.increments('id');
    table.index('author');
  });

  await knex.schema.createTable('answers', table => {
    table.integer('questionId').unsigned().notNullable();
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.boolean('correct').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.increments('id');
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.index('author');
  });

  await knex.schema.createTable('question_votes', table => {
    table.integer('questionId').unsigned().notNullable();
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
    table.integer('questionId').unsigned().notNullable();
    table.string('author').notNullable();
    table.datetime('timestamp').notNullable();
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('answer_votes', table => {
    table.integer('answerId').unsigned().notNullable();
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
    table.unique(['tag']);
    table.increments('id');
  });

  await knex.schema.createTable('question_tags', table => {
    table.integer('questionId').unsigned().notNullable();
    table.integer('tagId').notNullable();
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
