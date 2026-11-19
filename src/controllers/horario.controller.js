const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

const camposNecesarios = [ 'dia', 'entrada', 'inicio_ref', 'fin_ref', 'salida']

const pick = (body) => {
    return Object.fromEntries(camposNecesarios
        .filter((key) => key in body).map(
            (key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]
        )
    )
}

const baseQuery = () => db('horarios as h')
    .select(
        'h.idhorario',
        'h.dia',
        'h.entrada',
        'h.inicio_ref',
        'h.fin_ref',
        'h.salida'
    )

const checkContrato = async (idcontrato) => {
    const contrato = await db('contratos').where({ idcontrato }).first()
    if (!contrato) throw httpError(404, 'El contrato seleccionado no existe')
}

const validarHoras = (datos) => {
    if (
        datos.entrada    >= datos.salida ||
        datos.inicio_ref <= datos.entrada ||
        datos.fin_ref    <= datos.inicio_ref ||
        datos.fin_ref    >= datos.salida
    )
    throw httpError(400, 'Verifica las horas')
}

//Listar
exports.list = async (req, res) => {
    const horarios = await baseQuery().orderBy('h.idhorario', 'desc')
    res.json(horarios)
}
//Buscar
exports.get = async(req, res) => {
    const horario = await baseQuery().where({ idhorario : req.params.id}).first()
    if(!horario) throw httpError(404, 'Horario no encontrada')
    res.json(horario)
}

//Registrar
exports.create = async(req, res) => {

    const datos = pick(req.body)

    requireFields(datos, camposNecesarios)
    validarHoras(datos)

    const [idhorario] = await db('horarios').insert(datos)
    res.status(201).json({ idhorario, message: 'Horario registrado correctamente' })
}

//Actualizar
exports.update = async(req, res) => {
    const datos = pick(req.body)
    
    if (Object.keys(datos).length === 0) throw httpError(400, 'Nose enviaron campos para actualizar')
    const horario = await db('horarios')
        .where({ idhorario: req.params.id })
        .first()
    if (!horario) throw httpError(404, 'Horario no encontrado')

    validarHoras({ ...horario, ...datos })

    await db('horarios').where({ idhorario: req.params.id }).update(datos)
    res.json({message: 'Horario actualizado correctamente'})
}

//Eliminar
exports.remove = async (req, res) => {
    const eliminado = await db('horarios')
        .where({ idhorario: req.params.id })
        .del()
    if (!eliminado) throw httpError(404, 'Horario no encontrado')

    const asignado = await db('contratos')
        .where({ idhorario: req.params.id })
        .first()
    if (asignado) throw httpError(409, 'El horario esta asignado a uno o mas contratos')
    
    await db('horarios')
        .where({ idhorario: req.params.id })
        .del()
    res.json({message: 'Horario eliminado correctamente'})
}
