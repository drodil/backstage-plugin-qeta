/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('questions', table => {
    table.boolean('anonymous');
  });

  await knex.schema.alterTable('answers', table => {
    table.boolean('anonymous');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('questions', table => {
    table.dropColumn('anonymous');
  });

  await knex.schema.alterTable('answers', table => {
    table.dropColumn('anonymous');
  });
};
