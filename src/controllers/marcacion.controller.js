const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

// Campos permitidos para registrar y actualizar marcaciones
const camposNecesarios = ['idcontrato', 'fecha', 'dia', 'entrada', 'inicio_ref', 'fin_ref', 'salida']

// Filtrar los campos recibidos y limpiar strings vacíos a nulos en horas opcionales
const pick = (body) => {
    return Object.fromEntries(
        camposNecesarios.filter((key) => key in body).map(
            (key) => [
                key,
                ['entrada', 'inicio_ref', 'fin_ref', 'salida'].includes(key) && body[key] === ''
                    ? null
                    : typeof body[key] === 'string'
                        ? body[key].trim()
                        : body[key]
            ]
        )
    )
}

// Consulta base con información relacionada (Contrato -> Persona -> Cargo)
const baseQuery = () => {
    return db('marcaciones as m')
        .join('contratos as co', 'co.idcontrato', 'm.idcontrato')
        .join('personas as p', 'p.idpersona', 'co.idpersona')
        .join('cargos as c', 'c.idcargo', 'co.idcargo')
        .select(
            'm.idmarcacion',
            'm.idcontrato',
            'p.apellidos',
            'p.nombres',
            'c.nombre_cargo',
            'm.fecha',
            'm.dia',
            'm.entrada',
            'm.inicio_ref',
            'm.fin_ref',
            'm.salida',
            'm.created_at',
            'm.updated_at'
        )
}

// Verificar que exista la relación con el contrato
const checkRelaciones = async (datos) => {
    const contrato = await db('contratos')
        .where({ idcontrato: datos.idcontrato })
        .first()
    if (!contrato) { throw httpError(404, 'El contrato seleccionado no existe') }
}

// LISTAR
exports.list = async (req, res) => {
    const marcaciones = await baseQuery().orderBy('m.fecha', 'desc').orderBy('m.idmarcacion', 'desc')
    res.json(marcaciones)
}

// OBTENER MARCACIÓN POR ID
exports.get = async (req, res) => {
    const marcacion = await baseQuery()
        .where({ 'm.idmarcacion': req.params.id })
        .first()

    if (!marcacion) { throw httpError(404, 'Marcación no encontrada') }
    res.json(marcacion)
}

// REGISTRAR MARCACIÓN
exports.create = async (req, res) => {
    const datos = pick(req.body)

    requireFields(datos, ['idcontrato', 'fecha', 'dia'])
    await checkRelaciones(datos)

    const [idmarcacion] = await db('marcaciones').insert(datos)
    res.status(201).json({ idmarcacion, message: 'Marcación registrada correctamente' })
}

// ACTUALIZAR MARCACIÓN
exports.update = async (req, res) => {
    const datos = pick(req.body)
    if (Object.keys(datos).length === 0) { throw httpError(400, 'No se enviaron datos para actualizar') }

    const marcacion = await db('marcaciones')
        .where({ idmarcacion: req.params.id })
        .first()

    if (!marcacion) { throw httpError(404, 'Marcación no encontrada') }

    const datosActualizado = {
        ...marcacion,
        ...datos
    }
    await checkRelaciones(datosActualizado)
    await db('marcaciones')
        .where({ idmarcacion: req.params.id })
        .update(datos)
    res.json({ message: 'Marcación actualizada correctamente' })
}

// ELIMINAR MARCACIÓN
exports.remove = async (req, res) => {
    const eliminado = await db('marcaciones')
        .where({ idmarcacion: req.params.id })
        .del()
    if (!eliminado) { throw httpError(404, 'Marcación no encontrada') }
    res.json({ message: 'Marcación eliminada correctamente' })
}
