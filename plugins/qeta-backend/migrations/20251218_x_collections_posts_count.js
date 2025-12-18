/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('collections', table => {
    table.integer('postsCount').notNullable().defaultTo(0);
  });

  await knex.raw(`
    UPDATE collections
    SET "postsCount" = COALESCE((
      SELECT COUNT(*)
      FROM collection_posts
      WHERE collection_posts."collectionId" = collections.id
    ), 0)
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('collections', table => {
    table.dropColumn('postsCount');
  });
};
