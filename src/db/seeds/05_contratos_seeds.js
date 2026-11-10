/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('contratos').del()
  await knex('contratos').insert([
    {idpersona: 1, idcargo: 1, idsede: 1, modalidad: 'presencial', fecha_inicio: '2025-01-01', fecha_fin: null, estado: true},
    {idpersona: 2, idcargo: 2, idsede: 1, modalidad: 'presencial', fecha_inicio: '2025-01-25', fecha_fin: null, estado: true},
    {idpersona: 3, idcargo: 4, idsede: 1, modalidad: 'presencial', fecha_inicio: '2025-01-20', fecha_fin: null, estado: true},
  ]);
};
