/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  //await knex('table_name').del()
  await knex('sedes').insert([
    {idsede: 1, nombre_sede: 'Sede Principal', direccion: 'Av. Principal 123, Pueblo nuevo', telefono: '987654321', estado: true},
    {idsede: 2, nombre_sede: 'Sucursal Lima', direccion: 'Av. Guardia Civil 123, Chorrillos', telefono: '987668521', estado: true} 
  ]);
};
