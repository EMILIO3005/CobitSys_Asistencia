const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

// Campos permitidos
const camposNecesarios = ['idarea','nombre_cargo','estado']

// Filtrar y limpiar campos
const pick = (body) => {
    return Object.fromEntries(
        camposNecesarios.filter((key) => key in body).map(
            (key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]
        )
    )
}

// Consulta base con relación de áreas
const baseQuery = () => {
    return db('cargos as c').join('areas as a', 'a.idarea', 'c.idarea').select(
            'c.idcargo',
            'c.idarea',
            'a.nombre_area',
            'c.nombre_cargo',
            'c.estado'
        )
}

// Verificar existencia del área
const checkArea = async (idarea) => {
    const area = await db('areas').where({ idarea }).first()
    if (!area) { throw httpError(404, 'Área no encontrada') }
}
// LISTAR
exports.list = async (req, res) => {
    const cargos = await baseQuery().orderBy('c.nombre_cargo', 'asc')
    res.json(cargos)
}

// BUSCAR
exports.get = async (req, res) => {
    const row = await baseQuery().where({ 'c.idcargo': req.params.id }).first()
    if (!row) { throw httpError(404, 'Cargo no encontrado') }
    res.json(row)
}

// REGISTRAR
exports.create = async (req, res) => {
    const datos = pick(req.body)
    requireFields(datos, ['idarea','nombre_cargo'])
    // Verificar que el área exista
    await checkArea(datos.idarea)

    // Verificar cargo duplicado
    const existe = await db('cargos').where({ nombre_cargo: datos.nombre_cargo }).first()
    if (existe) { throw httpError(409, 'El cargo ya está registrado') }

    // Registrar cargo
    const [id] = await db('cargos').insert(datos)
    res.status(201).json({ id, message: 'Cargo registrado correctamente' })
}

// ACTUALIZAR
exports.update = async (req, res) => {
    const datos = pick(req.body)
    requireFields(datos, [ 'idarea','nombre_cargo' ])

    // Verificar existencia del cargo
    const cargo = await db('cargos').where({ idcargo: req.params.id }).first()

    if (!cargo) { throw httpError(404, 'Cargo no encontrado') }

    // Verificar que el área exista
    await checkArea(datos.idarea)

    // Verificar nombres duplicados
    const duplicado = await db('cargos')
        .where({ nombre_cargo: datos.nombre_cargo })
        .whereNot({ idcargo: req.params.id })
        .first()

    if (duplicado) { throw httpError(409, 'El nombre del cargo ya está registrado') }

    await db('cargos') .where({ idcargo: req.params.id }) .update(datos)
    res.json({ message: 'Cargo actualizado correctamente' })
}

// ELIMINAR
exports.remove = async (req, res) => {

    const num = await db('cargos').where({ idcargo: req.params.id }).del()
    if (!num) { throw httpError(404, 'Cargo no encontrado') }
    res.json({ message: 'Cargo eliminado correctamente' })
}
