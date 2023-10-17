/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex
    .table('questions')
    .update('anonymous', false)
    .whereNull('anonymous');
  await knex.table('answers').update('anonymous', false).whereNull('anonymous');
};

/**
 * @param {import('knex').Knex} _knex
 */
exports.down = async function down(_knex) {};
