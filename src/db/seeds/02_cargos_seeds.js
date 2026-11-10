/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('cargos').insert([
    {idarea: 1, nombre_cargo: 'Gerente General', estado: true},
    {idarea: 1, nombre_cargo: 'Asistente Administrativo', estado: true},
    {idarea: 2, nombre_cargo: 'Jefe de Recursos Humanos', estado: true},
    {idarea: 3, nombre_cargo: 'Jefe de sistemas', estado: true},
    {idarea: 3, nombre_cargo: 'Desarrollador de Software', estado: true}
    
  ]).onConflict('nombre_cargo').ignore()
};
