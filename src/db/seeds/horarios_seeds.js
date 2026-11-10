/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('horarios').del()
  await knex('horarios').insert([
    {idcontrato: 3, dia: 'Lunes a Viernes',  entrada: '09:00:00', inicio_ref: '13:00:00', fin_ref: '14:00:00', salida: '18:00:00'},
    {idcontrato: 1, dia: 'Lunes a Sabado',  entrada: '08:00:00', inicio_ref: '13:00:00', fin_ref: '14:00:00', salida: '17:00:00'},
    {idcontrato: 2, dia: 'Lunes a sabdo',  entrada: '08:00:00', inicio_ref: '13:00:00', fin_ref: '14:00:00', salida: '17:00:00'},
    
  ]);
};
