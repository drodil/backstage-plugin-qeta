/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // Drop dependent views to allow SQLite to alter the posts table
  await knex.schema.dropView('unique_authors');

  await knex.schema.alterTable('posts', table => {
    table.text('url').nullable().alter();
  });

  // Recreate dependent views
  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('comments').select('author'),
        knex('post_views').select('author'),
      ]),
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // Drop dependent views to allow SQLite to alter the posts table
  await knex.schema.dropView('unique_authors');

  await knex.schema.alterTable('posts', table => {
    table.string('url').nullable().alter();
  });

  // Recreate dependent views
  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('comments').select('author'),
        knex('post_views').select('author'),
      ]),
    );
  });
};
