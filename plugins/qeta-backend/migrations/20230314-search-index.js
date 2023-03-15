/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.schema.raw(
      `CREATE INDEX questions_search_content_index ON questions USING GIN (to_tsvector('english', title || ' ' || content))`,
    );
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.schema.raw(`DROP INDEX questions_search_content_index`);
  }
};
