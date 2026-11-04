/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("personas", (t) => {
    t.increments('idpersona').primary()
    t.string('apellidos', 100).notNullable()
    t.string('nombres', 100).notNullable()
    t.string('tipodoc', 50).notNullable()
    t.string('numdoc', 50).notNullable().unique()
    t.date('fechanac').notNullable()
    t.string('direccion', 200).notNullable()
    t.string('telefono', 9).notNullable()
    t.string('email', 100).notNullable()
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable("personas");
};
