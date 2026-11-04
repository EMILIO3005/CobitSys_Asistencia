/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("contratos", (t) => {
    t.increments('idcontrato').primary()
    t.integer('idpersona').unsigned().notNullable().references('idpersona').inTable('personas').onDelete('RESTRICT')
    t.integer('idcargo').unsigned().notNullable().references('idcargo').inTable('cargos').onDelete('RESTRICT')
    t.integer('idsede').unsigned().notNullable().references('idsede').inTable('sedes').onDelete('RESTRICT')
    t.string('modalidad', 100).notNullable()
    t.date('fecha_inicio').notNullable()
    t.date('fecha_fin')
    t.boolean('estado').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('contratos')
};
