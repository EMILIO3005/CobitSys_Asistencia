const db = require('../config/db')
const { httpError, requireFields } = require('../utils')

// Campos permitidos para registrar y actualizar contratos
const camposNecesarios = ['idpersona','idcargo','idsede','modalidad','fecha_inicio','fecha_fin','estado']

// Filtrar los campos recibidos
const pick = (body) => {
    return Object.fromEntries(
        camposNecesarios.filter((key) => key in body).map(
            (key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]
        )
    )
}

// Consulta base con información relacionada
const baseQuery = () => {
    return db('contratos as co')
        .join('personas as p', 'p.idpersona', 'co.idpersona')
        .join('cargos as c', 'c.idcargo', 'co.idcargo')
        .join('sedes as s', 's.idsede', 'co.idsede')
        .select(
            'co.idcontrato',
            'co.idpersona',
            'p.apellidos',
            'p.nombres',
            'co.idcargo',
            'c.nombre_cargo',
            'co.idsede',
            's.nombre_sede',
            'co.modalidad',
            'co.fecha_inicio',
            'co.fecha_fin',
            'co.estado',
            'co.created_at',
            'co.updated_at'
        )
}

// Verificar que existan las relaciones
const checkRelaciones = async (datos) => {

    const persona = await db('personas')
        .where({ idpersona: datos.idpersona })
        .first()

    if (!persona) {
        throw httpError(404, 'La persona seleccionada no existe')
    }

    const cargo = await db('cargos')
        .where({ idcargo: datos.idcargo })
        .first()

    if (!cargo) {
        throw httpError(404, 'El cargo seleccionado no existe')
    }

    const sede = await db('sedes')
        .where({ idsede: datos.idsede })
        .first()

    if (!sede) {
        throw httpError(404, 'La sede seleccionada no existe')
    }
}

// Validar fechas
const validarFechas = (datos) => {

    if (
        datos.fecha_fin &&
        datos.fecha_fin < datos.fecha_inicio
    ) {
        throw httpError(
            400,
            'La fecha de finalización no puede ser anterior a la fecha de inicio'
        )
    }
}

// LISTAR CONTRATOS
exports.list = async (req, res) => {

    const contratos = await baseQuery()
        .orderBy('co.idcontrato', 'desc')

    res.json(contratos)
}

// OBTENER CONTRATO POR ID
exports.get = async (req, res) => {

    const contrato = await baseQuery()
        .where({ 'co.idcontrato': req.params.id })
        .first()

    if (!contrato) {
        throw httpError(404, 'Contrato no encontrado')
    }

    res.json(contrato)
}

// REGISTRAR CONTRATO
exports.create = async (req, res) => {

    const datos = pick(req.body)

    requireFields(datos, [
        'idpersona',
        'idcargo',
        'idsede',
        'modalidad',
        'fecha_inicio'
    ])

    await checkRelaciones(datos)

    validarFechas(datos)

    const [idcontrato] = await db('contratos').insert(datos)

    res.status(201).json({
        idcontrato,
        message: 'Contrato registrado correctamente'
    })
}

// ACTUALIZAR CONTRATO
exports.update = async (req, res) => {

    const datos = pick(req.body)

    requireFields(datos, [
        'idpersona',
        'idcargo',
        'idsede',
        'modalidad',
        'fecha_inicio'
    ])

    const contrato = await db('contratos')
        .where({ idcontrato: req.params.id })
        .first()

    if (!contrato) {
        throw httpError(404, 'Contrato no encontrado')
    }

    await checkRelaciones(datos)

    validarFechas(datos)

    await db('contratos')
        .where({ idcontrato: req.params.id })
        .update(datos)

    res.json({
        message: 'Contrato actualizado correctamente'
    })
}

// ELIMINAR CONTRATO
exports.remove = async (req, res) => {

    const eliminado = await db('contratos')
        .where({ idcontrato: req.params.id })
        .del()

    if (!eliminado) {
        throw httpError(404, 'Contrato no encontrado')
    }

    res.json({
        message: 'Contrato eliminado correctamente'
    })
}
