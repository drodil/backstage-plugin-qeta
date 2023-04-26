/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('question_attachments', table => {
    table.increments('id').primary();
    table.string('uuid').notNullable();
    table.string('locationType').notNullable();
    table.string('locationUri').nullable();
    table.string('path').nullable();
    table.binary('binaryImage').nullable();
    table.string('mimeType').notNullable();
    table.string('extension').notNullable();
    table.string('creator').nullable();
    table.date('created').notNullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('question_attachments');
};
