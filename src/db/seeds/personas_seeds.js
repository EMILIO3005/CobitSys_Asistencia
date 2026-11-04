/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('usuarios').del()
  await knex('personas').del()
  await knex('personas').insert([
    {idpersona: 1, apellidos: 'Cueva', nombres: 'Emiliano', tipodoc: 'DNI', numdoc: '12345678', fechanac: '2000-01-01', direccion: 'Calle Falsa 123', telefono: '987654321', email: 'emilio@gmail.com'},
    {idpersona: 2, apellidos: 'Gonzalez', nombres: 'María', tipodoc: 'DNI', numdoc: '87654321', fechanac: '1985-05-15', direccion: 'Avenida Principal 456', telefono: '912345678', email: 'maria@gmail.com'},
    {idpersona: 3, apellidos: 'Rodriguez', nombres: 'Carlos', tipodoc: 'DNI', numdoc: '11223344', fechanac: '1992-12-10', direccion: 'Plaza Central 789', telefono: '998877665', email: 'carlos@gmail.com'}
  ]);
};
