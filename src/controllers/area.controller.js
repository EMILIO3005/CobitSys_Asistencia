const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

// Campos permitidos
const camposNecesarios = ['nombre_area', 'estado']

// Filtrar y limpiar campos
const pick = (body) => {
    return Object.fromEntries(
        camposNecesarios.filter((key) => key in body).map(
            (key) => [ key,typeof body[key] === 'string' ? body[key].trim() : body[key]]
        )
    )
}

// LISTAR
exports.list = async (req, res) => {

    const areas = await db('areas')
        .select(
            'idarea',
            'nombre_area',
            'estado',
            'created_at',
            'updated_at'
        )
        .orderBy('nombre_area', 'asc')
    res.json(areas)
}

// BUSCAR
exports.get = async (req, res) => {

    const row = await db('areas')
        .where({ idarea: req.params.id })
        .first()

    if (!row) { throw httpError(404, 'Área no encontrada') }
    res.json(row)
}

// REGISTRAR
exports.create = async (req, res) => {

    const datos = pick(req.body)
    requireFields(datos, ['nombre_area'])

    // Verificar área duplicada
    const existe = await db('areas')
        .where({ nombre_area: datos.nombre_area })
        .first()

    if (existe) { throw httpError(409, 'El área ya está registrada') }

    const [idarea] = await db('areas').insert(datos)

    res.status(201).json({idarea, message: 'Área registrada correctamente'})
}

// ACTUALIZAR
exports.update = async (req, res) => {
    const datos = pick(req.body)
    requireFields(datos, ['nombre_area'])

    // Verificar existencia
    const area = await db('areas')
        .where({ idarea: req.params.id })
        .first()

    if (!area) { throw httpError(404, 'Área no encontrada') }

    // Verificar duplicados
    const duplicado = await db('areas')
        .where({ nombre_area: datos.nombre_area })
        .whereNot({ idarea: req.params.id })
        .first()

    if (duplicado) { throw httpError(409, 'El nombre del área ya está registrado') }
    await db('areas')
        .where({ idarea: req.params.id })
        .update(datos)
    res.json({ message: 'Área actualizada correctamente' })
}
// ELIMINAR
exports.remove = async (req, res) => {
    const num = await db('areas')
        .where({ idarea: req.params.id })
        .del()

    if (!num) { throw httpError(404, 'Área no encontrada') }
    res.json({ message: 'Área eliminada correctamente' })
}
