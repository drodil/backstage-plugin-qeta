/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('post_revisions', table => {
    table.increments('id').primary();
    table
      .integer('postId')
      .notNullable()
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('content').notNullable();
    table.text('url').nullable();
    table.text('headerImage').nullable();
    table.text('tags').nullable();
    table.text('entities').nullable();
    table.timestamp('created').notNullable().defaultTo(knex.fn.now());
    table.text('createdBy').notNullable();

    table.index(['postId', 'created']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('post_revisions');
};
