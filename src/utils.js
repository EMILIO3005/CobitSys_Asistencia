//Funcionalidades compartidas (EXPRESIONES REGULARES)

//Simplifica el manejo de errores
exports.httpError = (status, message) =>
  Object.assign(new Error(message), { status });


//Campos obligatorios 
exports.requireFields = (body, fields) => {
  const missing = fields.filter(
    (f) => body[f] === undefined || String(body[f]).trim() === "",
  );
  if (missing.length)
    throw exports.httpError(400, `Campos obligatorios: ${missing.join(", ")}`);
};


//Email escrito correctamente

exports.isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));


//Validar las credenciales de acceso
exports.checkCredentials = (
  { nombre_usuario, clave_acceso },
  { claveObligatoria },
) => {
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(nombre_usuario || ""))
    throw exports.httpError(
      400,
      "Usuario: 3 a 50 caracteres (letras, números, _ . -)",
    );
  if (
    (claveObligatoria || clave_acceso) &&
    (typeof clave_acceso !== "string" ||
      clave_acceso.length < 8 ||
      clave_acceso.length > 72)
  )
    throw exports.httpError(
      400,
      "La contraseña debe tener entre 8 y 72 caracteres",
    );
};

// Validar si una fecha corresponde a un día laboral
exports.validarDiaLaboral = (rango, fecha) => {
  const diasSemana = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado'
  ]

  const diasLaborales = {
    'Lunes a Viernes': [1, 2, 3, 4, 5],
    'Lunes a Sabado': [1, 2, 3, 4, 5, 6],
    'Todos los dias': [0, 1, 2, 3, 4, 5, 6]
  }

  const [anio, mes, dia] = fecha.split('-').map(Number)

  const numeroDia = new Date(
    Date.UTC(anio, mes - 1, dia)
  ).getUTCDay()

  const diaActual = diasSemana[numeroDia]

  return diasLaborales[rango]?.includes(numeroDia)
    ? diaActual
    : null
}