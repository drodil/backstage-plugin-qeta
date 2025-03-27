/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.schema.raw(
      `CREATE INDEX tag_search_content_index ON tags USING GIN (to_tsvector('english', tag || ' ' || description))`,
    );
    await knex.schema.raw(
      `CREATE INDEX collection_search_content_index ON collections USING GIN (to_tsvector('english', title || ' ' || description))`,
    );
    await knex.schema.raw(
      `CREATE INDEX answer_search_content_index ON answers USING GIN (to_tsvector('english', content))`,
    );
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.schema.raw(`DROP INDEX tag_search_content_index`);
    await knex.schema.raw(`DROP INDEX collection_search_content_index`);
    await knex.schema.raw(`DROP INDEX answer_search_content_index`);
  }
};
