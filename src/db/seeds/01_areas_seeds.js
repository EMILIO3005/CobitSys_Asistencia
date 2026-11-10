/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('areas').insert([
    {idarea: 1, nombre_area: 'Administración', estado: true},
    {idarea: 2, nombre_area: 'Recursos Humanos', estado: true},
    {idarea: 3, nombre_area: 'Sistemas', estado: true}
  ]).onConflict('nombre_area').ignore();
};
