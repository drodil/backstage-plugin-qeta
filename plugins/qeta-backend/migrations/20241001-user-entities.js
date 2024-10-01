/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('user_entities', table => {
    table.string('userRef').notNullable();
    table.string('entityRef').notNullable();
    table.primary(['userRef', 'entityRef']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('user_entities');
};
