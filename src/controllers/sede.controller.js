const db = require('../config/db')
const { httError, requireFields }= require('../utils')



const camposNecesarios = ['nombre_sede', 'direccion', 'telefono' ]



const pick = (body) => {
  Object.fromEntries(
    camposNecesarios.filter((key) => key in body).map(
      (key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]
    )
  )
}


exports.list = async(req,res) =>{
  res.json(
    await db('sedes')
    .select("idsede", ...camposRequeridos)
    .orderBy("nombre_sede")
  )
}
//Buscar
exports.get = async(req, res) => {
  const row = await db("sedes").where({ idsede: req.params.id}).first()
  if(!row) throw httError(404, 'Sede no encontrada')
    res.json(row)
}

//Registrar
exports.create = async(req, res) => {
  requireFields(req.body, ["nombre_sede", "direccion", "telefono"])

  const [idsede] = await db("sedes").insert(req.body)
  res.status(201).json({ idsede, message: 'Sede registrada correctamente' })
}

exports.update = async(req, res) => {
  requireFields(req.body, ["nombre_sede", "direccion", "telefono"])

  const num = await db("sedes").where({ idsede: req.params.id}).update(req.body)

  if (!num) throw httError(404, "Sede no encontrada")
  res.json({ message: "Sede actualizada correctamente" })
}

exports.remove = async(req,res) =>{
  const num = await db("sedes")
    .where({ idsede: req.params.id})
    .del()
  if (!num) throw httpError(404, "Sede no encontrada")

  res.json({ message: "Sede eliminada"})
}
