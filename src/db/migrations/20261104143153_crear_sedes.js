/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("sedes", (t) => {
    t.increments('idsede').primary()
    t.string('nombre_sede', 100).notNullable().unique()
    t.string('direccion', 100).notNullable()
    t.string('telefono', 9)
    t.boolean('estado').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('sedes')
};
