/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("horarios", (t) => {
    t.increments('idhorario').primary()
    t.integer('idcontrato').unsigned().notNullable().references('idcontrato').inTable('contratos').onDelete('RESTRICT')
    t.string('dia', 10).notNullable()
    t.time('entrada').notNullable()
    t.time('inicio_ref').notNullable()
    t.time('fin_ref').notNullable()
    t.time('salida').notNullable()
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("horarios")
};
