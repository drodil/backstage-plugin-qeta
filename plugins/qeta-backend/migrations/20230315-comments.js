/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('question_comments', table => {
    table.string('author').notNullable();
    table.text('content').notNullable();
    table.datetime('created').notNullable();
    table.datetime('updated').nullable();
    table.string('updatedBy').nullable();
    table.integer('questionId').unsigned().notNullable();
    table.increments('id');
    table
      .foreign('questionId')
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
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('question_comments');
  await knex.schema.dropTable('answer_comments');
};
