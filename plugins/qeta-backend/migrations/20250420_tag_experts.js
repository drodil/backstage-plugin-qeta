/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('tag_experts', table => {
    table.integer('tagId').unsigned().notNullable();
    table.string('entityRef').notNullable();
    table.unique(['tagId', 'entityRef']);
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('tag_experts');
};
