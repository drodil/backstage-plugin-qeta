/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('templates', table => {
    table.increments('id');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.text('questionTitle').nullable();
    table.text('questionContent').nullable();
  });

  await knex.schema.createTable('template_tags', table => {
    table.integer('templateId').unsigned().notNullable();
    table.integer('tagId').notNullable();
    table.primary(['templateId', 'tagId']);
    table
      .foreign('templateId')
      .references('id')
      .inTable('templates')
      .onDelete('CASCADE');
    table.foreign('tagId').references('id').inTable('tags').onDelete('CASCADE');
  });

  await knex.schema.createTable('template_entities', table => {
    table.integer('templateId').unsigned().notNullable();
    table.integer('entityId').notNullable();
    table.primary(['templateId', 'entityId']);
    table
      .foreign('templateId')
      .references('id')
      .inTable('templates')
      .onDelete('CASCADE');
    table
      .foreign('entityId')
      .references('id')
      .inTable('entities')
      .onDelete('CASCADE');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('templates');
  await knex.schema.dropTable('template_tags');
  await knex.schema.dropTable('template_entities');
};
