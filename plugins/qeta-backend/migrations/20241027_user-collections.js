/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('user_collections', table => {
    table.string('userRef').notNullable();
    table.integer('collectionId').notNullable();
    table.primary(['userRef', 'collectionId']);
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('user_collections');
};
