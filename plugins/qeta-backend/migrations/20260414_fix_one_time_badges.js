/**
 * Fix duplicate one-time badge awards.
 *
 * Root cause: SQL treats NULL as unequal to NULL in UNIQUE constraints, so the
 * composite unique index on (userRef, badgeId, uniqueKey) never prevented
 * multiple rows with uniqueKey = NULL (used for one-time badges).
 *
 * This migration:
 *   1. Removes duplicate one-time badge rows, keeping the earliest award.
 *   2. Drops the old composite unique index that didn't protect NULL rows.
 *   3. Adds a partial unique index for one-time awards  (uniqueKey IS NULL).
 *   4. Adds a partial unique index for repetitive awards (uniqueKey IS NOT NULL).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // Step 1: Remove duplicate one-time badge rows, keeping the earliest (min id)
  await knex.raw(`
    DELETE FROM user_badges
    WHERE "uniqueKey" IS NULL
      AND id NOT IN (
        SELECT MIN(id)
        FROM user_badges
        WHERE "uniqueKey" IS NULL
        GROUP BY "userRef", "badgeId"
      )
  `);

  // Step 2: Drop the old composite unique index
  await knex.schema.alterTable('user_badges', table => {
    table.dropUnique(['userRef', 'badgeId', 'uniqueKey']);
  });

  // Step 3: Partial unique index for one-time badges (uniqueKey IS NULL)
  // Both PostgreSQL and SQLite 3.8.9+ support partial indexes.
  await knex.raw(
    'CREATE UNIQUE INDEX "user_badges_one_time_unique" ON "user_badges" ("userRef", "badgeId") WHERE "uniqueKey" IS NULL',
  );

  // Step 4: Partial unique index for repetitive badges (uniqueKey IS NOT NULL)
  await knex.raw(
    'CREATE UNIQUE INDEX "user_badges_repetitive_unique" ON "user_badges" ("userRef", "badgeId", "uniqueKey") WHERE "uniqueKey" IS NOT NULL',
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS "user_badges_one_time_unique"');
  await knex.raw('DROP INDEX IF EXISTS "user_badges_repetitive_unique"');

  await knex.schema.alterTable('user_badges', table => {
    table.unique(['userRef', 'badgeId', 'uniqueKey']);
  });
};
