/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.renameTable('question_components', 'question_entities');
  await knex.schema.renameTable('components', 'entities');
  await knex.schema.table('question_entities', table => {
    table.renameColumn('componentId', 'entityId');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('entities');
  await knex.schema.dropTable('question_entities');
};
