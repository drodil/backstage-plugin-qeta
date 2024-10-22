/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('answer_comments').select('author'),
        knex('post_comments').select('author'),
        knex('post_views').select('author'),
      ]),
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropView('unique_authors');
};
