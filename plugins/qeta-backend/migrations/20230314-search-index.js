/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.raw(
    `CREATE INDEX questions_search_content_index ON questions USING GIN (to_tsvector('english', title || ' ' || content))`,
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.raw(`DROP INDEX questions_search_content_index`);
};
