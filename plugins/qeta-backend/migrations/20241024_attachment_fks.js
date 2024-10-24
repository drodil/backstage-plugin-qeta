/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('attachments', table => {
    table.dropForeign('questionId');
    table.dropForeign('answerId');
    table.dropForeign('collectionId');
    table
      .foreign('postId')
      .references('id')
      .inTable('posts')
      .onDelete('SET NULL');
    table
      .foreign('answerId')
      .references('id')
      .inTable('answers')
      .onDelete('SET NULL');
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('SET NULL');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('attachments', table => {
    table.dropForeign('postId');
    table.dropForeign('answerId');
    table.dropForeign('collectionId');
    table
      .foreign('questionId')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table
      .foreign('answerId')
      .references('id')
      .inTable('answers')
      .onDelete('CASCADE');
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
  });
};
