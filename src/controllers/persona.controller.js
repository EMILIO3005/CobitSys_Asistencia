const db = require('../config/db')
const { httpError, requireFields, isEmail } = require('../utils')



//Creamos una lista de campos requeridos para la creación de un usuario
const camposRequeridos = ['apellidos', 'nombres','tipodoc','numdoc','fechanac','direccion','telefono','email']

const pick = (body) => {
    Object.fromEntries(
        camposRequeridos.filter((key) => key in body).map(
            (key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]
        )
    )
}

exports.list = async (req, res) => {
    res.json(
        await db('personas')
        .select('idpersona', ...camposRequeridos)
        .orderBy("apellidos")
    )
}

//Buscar
exports.get = async(req,res) => {
    const row = await db('personas').where({idpersona: req.params.id}).first()
    if(!row) throw httpError(404, 'Persona no encontrada')
    res.json(row)
}

//Registrar
exports.create = async (req, res) => {
    requireFields(req.body, ["apellidos", "nombres", "tipodoc", "numdoc", "fechanac", "direccion", "telefono", "email"])

    if (!isEmail(req.body.email)) 
        throw httpError(400, 'El email no es válido')

    const [idpersona] = await db('personas').insert(req.body)
    res.status(201).json({idpersona, message: 'Persona creada correctamente'})
}

//Actualizar

exports.update = async (req, res) => {
    requireFields(req.body, ["apellidos", "nombres", "tipodoc", "numdoc", "fechanac", "direccion", "telefono", "email"])

    if (!isEmail(req.body.email)) {
        throw httpError(400, 'El email no es válido')
    }
    const num = await db('personas')
        .where({idpersona: req.params.id})
        .update(req.body)
    if (!num) throw httpError(404, 'Persona no encontrada')
    res.json({message: 'Persona actualizada correctamente'})
}

//Eliminar
exports.remove = async (req, res) => {
    const num = await db('personas')
        .where({idpersona: req.params.id})
        .del()
    if (!num) throw httpError(404, 'Persona no encontrada')
    res.json({message: 'Persona eliminada correctamente'})
}


