/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('cargos', (t) => {
    t.increments('idcargo').primary()
    t.integer('idarea').unsigned().notNullable().references('idarea').inTable('areas').onDelete('RESTRICT')
    t.string('nombre_cargo', 100).notNullable().unique()
    t.boolean('estado').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('cargos')
};
