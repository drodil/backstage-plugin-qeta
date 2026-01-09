/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('collection_tags', table => {
    table.integer('collectionId').unsigned().notNullable();
    table.integer('tagId').notNullable();
    table.primary(['collectionId', 'tagId']);
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
  });

  await knex.schema.createTable('collection_entities', table => {
    table.integer('collectionId').unsigned().notNullable();
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
    table.integer('entityId').unsigned().notNullable();
    table
      .foreign('entityId')
      .references('id')
      .inTable('entities')
      .onDelete('CASCADE');
    table.primary(['collectionId', 'entityId']);
  });

  await knex.schema.createTable('collection_users', table => {
    table.integer('collectionId').unsigned().notNullable();
    table
      .foreign('collectionId')
      .references('id')
      .inTable('collections')
      .onDelete('CASCADE');
    table.string('userRef').notNullable();
    table.primary(['collectionId', 'userRef']);
  });

  await knex.schema.alterTable('collection_posts', table => {
    table.boolean('automatic').defaultTo(false).notNullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('collection_tags');
  await knex.schema.dropTable('collection_entities');
  await knex.schema.dropTable('collection_users');
  await knex.schema.alterTable('collection_posts', table => {
    table.dropColumn('automatic');
  });
};
