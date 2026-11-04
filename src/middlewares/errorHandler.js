//Getor para el manejo de errores
exports.notFound = (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada'})
}

exports.errorHandler = (err, req, res, next) => {

  //Si existe un error ... detenemos y retornamos un mensaje en formato json
  if (err.status) {return res.status(err.status).json({ message: err.message })}


  //mismo valor, mismo tipo ===
  //Error de duplicidad
  if (err.code === 'ER_DUP_ENTRY'){
    return res.status(409).json({ message: 'Ya existe un registro con ese valor'})
  }
  
  //Error de dependencia foranea
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'No se puede eliminar, registro en uso'})
  }

  //Error de ID no existe
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'No existe el registro indicado'})
  }

  //Testing (desarrollo)
  console.error(err)

  //Error general de falla en la app
  //res => result
  res.status(500).json({ message: 'Error interno en el servidor'})
}