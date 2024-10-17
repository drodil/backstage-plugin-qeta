/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('user_stats', table => {
    table.string('userRef').notNullable();
    table.integer('totalViews').unsigned().notNullable();
    table.integer('totalQuestions').unsigned().notNullable();
    table.integer('totalAnswers').unsigned().notNullable();
    table.integer('totalComments').unsigned().notNullable();
    table.integer('totalVotes').unsigned().notNullable();
    table.date('date').defaultTo('NOW').notNullable();
    table.unique(['userRef', 'date']);
  });

  await knex.schema.createTable('global_stats', table => {
    table.integer('totalViews').unsigned().notNullable();
    table.integer('totalQuestions').unsigned().notNullable();
    table.integer('totalAnswers').unsigned().notNullable();
    table.integer('totalTags').unsigned().notNullable();
    table.integer('totalComments').unsigned().notNullable();
    table.integer('totalUsers').unsigned().notNullable();
    table.integer('totalVotes').unsigned().notNullable();
    table.date('date').defaultTo('NOW').notNullable();
    table.unique(['date']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('user_stats');
  await knex.schema.dropTable('global_stats');
};
