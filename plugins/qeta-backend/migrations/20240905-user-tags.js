/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('user_tags', table => {
    table.string('userRef').notNullable();
    table.integer('tagId').notNullable();
    table.primary(['userRef', 'tagId']);
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('user_tags');
};
