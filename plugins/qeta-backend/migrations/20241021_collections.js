/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('collections', table => {
    table.increments('id');
    table.string('title').notNullable();
    table.string('description').nullable();
    table.string('owner').notNullable();
    table.datetime('created').notNullable();
    table.string('readAccess').defaultTo('private').notNullable();
    table.string('editAccess').defaultTo('private').notNullable();
    table.string('headerImage').nullable();
  });

  await knex.schema.createTable('collection_posts', table => {
    table.integer('collectionId').unsigned().notNullable();
    table.integer('postId').unsigned().notNullable();
    table.primary(['collectionId', 'postId']);
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
    table
      .foreign('postId')
      .references('id')
      .inTable('posts')
      .onDelete('CASCADE');
  });

  await knex.schema.alterTable('attachments', table => {
    table.integer('collectionId').unsigned();
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('collections');
  await knex.schema.dropTable('collection_posts');
  await knex.schema.alterTable('attachments', table => {
    table.dropColumn('collectionId');
  });
};
