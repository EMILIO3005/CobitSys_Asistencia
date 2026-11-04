/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("areas", (t) =>{
    t.increments('idarea').primary()
    t.string('nombre_area', 100).notNullable().unique()
    t.boolean('estado').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('areas')
};
