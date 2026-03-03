/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('post_revisions', table => {
    table.text('attachments').nullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('post_revisions', table => {
    table.dropColumn('attachments');
  });
};
