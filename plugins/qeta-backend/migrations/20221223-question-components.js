/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('components', table => {
    table.string('entity_ref').notNullable();
    table.unique(['entity_ref']);
    table.increments('id');
  });

  await knex.schema.createTable('question_components', table => {
    table.integer('questionId').unsigned().notNullable();
    table.integer('componentId').notNullable();
    table.primary(['questionId', 'componentId']);
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table
      .foreign('componentId')
      .references('id')
      .inTable('components')
      .onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('components');
  await knex.schema.dropTable('question_components');
};
