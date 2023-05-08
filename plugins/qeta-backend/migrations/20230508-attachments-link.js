/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('attachments', table => {
    table.integer('questionId').unsigned();
    table.integer('answerId').unsigned();
    table
      .foreign('questionId')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
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
  await knex.schema.alterTable('attachments', table => {
    table.dropColumn('questionId');
    table.dropColumn('answerId');
  });
};
