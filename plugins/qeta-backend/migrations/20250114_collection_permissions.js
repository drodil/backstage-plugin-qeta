/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('collections', table => {
    table.dropColumn('readAccess');
    table.dropColumn('editAccess');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.createTable('collections', table => {
    table.string('readAccess').defaultTo('private').notNullable();
    table.string('editAccess').defaultTo('private').notNullable();
  });
};
