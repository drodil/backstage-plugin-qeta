/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  if (knex.client.config.client === 'pg') {
    try {
      await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS posts_title_trgm_idx ON posts USING gin (title gin_trgm_ops)',
      );
      await knex.raw(
        'CREATE INDEX IF NOT EXISTS posts_content_trgm_idx ON posts USING gin (content gin_trgm_ops)',
      );

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS posts_author_trgm_idx ON posts USING gin (author gin_trgm_ops)',
      );

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS tags_tag_trgm_idx ON tags USING gin (tag gin_trgm_ops)',
      );

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS answers_content_trgm_idx ON answers USING gin (content gin_trgm_ops)',
      );

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS comments_content_trgm_idx ON comments USING gin (content gin_trgm_ops)',
      );

      await knex.raw(
        'CREATE INDEX IF NOT EXISTS collections_title_trgm_idx ON collections USING gin (title gin_trgm_ops)',
      );

      // Remove old indexes in favor of trigram indexes
      await knex.raw('DROP INDEX IF EXISTS questions_search_content_index');
      await knex.raw('DROP INDEX IF EXISTS tag_search_content_index');
      await knex.raw('DROP INDEX IF EXISTS collection_search_content_index');
      await knex.raw('DROP INDEX IF EXISTS answer_search_content_index');
    } catch (error) {
      const message =
        'Failed to create the "pg_trgm" extension. ' +
        'Ensure that the extension is installed and that the database user running migrations ' +
        'has sufficient privileges (typically CREATE EXTENSION), or ask a database administrator ' +
        'to install the extension in the target database before running this migration. ' +
        '\n\n' +
        'If you want to install the extension manually and setup the indexes, run the SQL commands manually from\n' +
        'https://github.com/drodil/backstage-plugin-qeta/blob/main/plugins/qeta-backend/migrations/20260108_pg_trgm_extension.js' +
        '\n\n' +
        `Original error: ${
          error instanceof Error ? error.message : String(error)
        }`;
      console.warn(message);
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.raw('DROP INDEX IF EXISTS posts_title_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS posts_content_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS posts_author_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS tags_tag_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS answers_content_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS comments_content_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS collections_title_trgm_idx');
    await knex.raw('DROP EXTENSION IF EXISTS pg_trgm');

    // Restore
    await knex.schema.raw(
      `CREATE INDEX IF NOT EXISTS questions_search_content_index ON questions USING GIN (to_tsvector('english', title || ' ' || content))`,
    );
    await knex.schema.raw(
      `CREATE INDEX IF NOT EXISTS tag_search_content_index ON tags USING GIN (to_tsvector('english', tag || ' ' || description))`,
    );
    await knex.schema.raw(
      `CREATE INDEX IF NOT EXISTS collection_search_content_index ON collections USING GIN (to_tsvector('english', title || ' ' || description))`,
    );
    await knex.schema.raw(
      `CREATE INDEX IF NOT EXISTS answer_search_content_index ON answers USING GIN (to_tsvector('english', content))`,
    );
  }
};
