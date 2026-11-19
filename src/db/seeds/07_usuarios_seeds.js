const bcrypt = require('bcryptjs')
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  //await knex('table_name').del()
  await knex('usuarios').insert([
    {idusuario: 1, idpersona:1, nombre_usuario: 'emilio', clave_acceso:bcrypt.hashSync('emilio123', 10), nivel_acceso: 'ADMIN', estado: true},
    {idusuario: 2, idpersona:2, nombre_usuario: 'maria', clave_acceso: bcrypt.hashSync('maria123', 10), nivel_acceso: 'USUARIO', estado: true},
    {idusuario: 3, idpersona:3, nombre_usuario: 'carlos', clave_acceso: bcrypt.hashSync('carlos123', 10), nivel_acceso: 'USUARIO', estado: true}
  ]);
};
