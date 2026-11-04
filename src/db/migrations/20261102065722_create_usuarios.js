/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('usuarios', (t) => {
    t.increments('idusuario').primary()
    t.integer('idpersona').unsigned().notNullable().references('idpersona').inTable('personas').onDelete('RESTRICT').onUpdate('CASCADE')
    t.string('nombre_usuario', 50).notNullable().unique()
    t.string('clave_acceso', 250).notNullable()
    t.enum('nivel_acceso', ['ADMIN', 'USUARIO']).notNullable().defaultTo('USUARIO')
    t.boolean('estado', true).notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('usuarios');
};
