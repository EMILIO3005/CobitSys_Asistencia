/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("marcaciones", (t) => {
    t.increments('idmarcacion').primary()
    t.integer('idcontrato').unsigned().notNullable().references('idcontrato').inTable('contratos').onDelete('RESTRICT').onUpdate('CASCADE')
    t.date('fecha').notNullable()
    t.string('dia', 10).notNullable()
    t.time('entrada')
    t.time('inicio_ref')
    t.time('fin_ref')
    t.time('salida')
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("marcaciones")
};
