/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('post_ai_answers', table => {
    table.integer('postId').unsigned().notNullable();
    table.text('answer').notNullable();
    table.datetime('created').defaultTo('NOW').notNullable();
    table.increments('id');
    table
      .foreign('postId')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table.unique(['postId']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('post_ai_answers');
};
