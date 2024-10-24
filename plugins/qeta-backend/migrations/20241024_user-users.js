/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('user_users', table => {
    table.string('userRef').notNullable();
    table.string('followedUserRef').notNullable();
    table.primary(['userRef', 'followedUserRef']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('user_users');
};
