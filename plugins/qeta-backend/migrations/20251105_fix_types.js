/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('collections', table => {
    table.text('description').nullable().alter();
    table.text('headerImage').nullable().alter();
  });

  await knex.schema.dropView('unique_authors');
  await knex.schema.alterTable('posts', table => {
    table.text('headerImage').nullable().alter();
  });
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

  await knex.schema.alterTable('attachments', table => {
    table.text('locationUri').nullable().alter();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('collections', table => {
    table.string('description').nullable().alter();
    table.string('headerImage').nullable().alter();
  });

  await knex.schema.dropView('unique_authors');
  await knex.schema.alterTable('posts', table => {
    table.string('headerImage').nullable().alter();
  });
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

  await knex.schema.alterTable('attachments', table => {
    table.string('locationUri').nullable().alter();
  });
};
