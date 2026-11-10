const db = require('../config/db')
const { httpError, requireFields, validarDiaLaboral } = require('../utils')

const obtenerFechaHora = () => {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(new Date())

    const valor = (tipo) => partes.find(p => p.type === tipo).value

    return {
        fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
        hora: `${valor('hour')}:${valor('minute')}:${valor('second')}`
    }
}



// Campos permitidos para registrar y actualizar marcaciones
const camposNecesarios = ['idcontrato', 'fecha', 'entrada', 'inicio_ref', 'fin_ref', 'salida']

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
    const { tipo } = req.body
    const tipos = ['entrada', 'inicio_ref', 'fin_ref', 'salida']

    if (!tipos.includes(tipo))  throw httpError(400, 'Tipo de marcación no válido')
    
    const { fecha, hora } = obtenerFechaHora()
    // Buscar contrato activo
    const contrato = await db('contratos')
        .where({idpersona: req.user.idpersona, estado: true })
        .where('fecha_inicio', '<=', fecha)
        .where((q) => q.whereNull('fecha_fin').orWhere('fecha_fin', '>=', fecha))
        .first()
    if (!contrato) throw httpError(404, 'No tienes un contrato activo')
    // Buscar horario asignado
    const horario = await db('horarios')
        .where({ idcontrato: contrato.idcontrato })
        .first()

    if (!horario) throw httpError(404, 'No tienes un horario asignado')

    // Validar día laboral
    const dia = validarDiaLaboral(horario.dia, fecha)
    if (!dia) throw httpError(400, 'Hoy no corresponde a un día laboral')
    // Buscar marcación del día
    const marcacion = await db('marcaciones')
        .where({ idcontrato: contrato.idcontrato, fecha })
        .first()
    // Definir marcación anterior
    const anterior = {
        entrada: null,
        inicio_ref: 'entrada',
        fin_ref: 'inicio_ref',
        salida: 'fin_ref'
    }

    if (!marcacion && tipo !== 'entrada')  throw httpError(400, 'Primero debes registrar tu entrada')
    // Crear registro inicial
    if (!marcacion) {
        const datos = { idcontrato: contrato.idcontrato,fecha,dia,entrada: hora }
        const [idmarcacion] = await db('marcaciones').insert(datos)
        return res.status(201).json({idmarcacion, tipo, hora, message: 'Entrada registrada correctamente'})
    }

    // Validar duplicados y orden
    const campoAnterior = anterior[tipo]

    if (marcacion[tipo]) throw httpError(400, 'Esta marcación ya fue registrada')
    if (campoAnterior && hora <= marcacion[campoAnterior])  throw httpError(400, 'La hora debe ser posterior a la marcación anterior') 
    // Actualizar marcación
    await db('marcaciones').where({ idmarcacion: marcacion.idmarcacion }).update({ [tipo]: hora })
    res.json({idmarcacion: marcacion.idmarcacion, tipo, hora, message: 'Marcación registrada correctamente'})
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

// CONSULTAR ASISTENCIA DEL DÍA
exports.today = async (req, res) => {
    const { fecha } = obtenerFechaHora()
    // Buscar contrato activo
    const contrato = await db('contratos')
        .where({ idpersona: req.user.idpersona, estado: true })
        .where('fecha_inicio', '<=', fecha)
        .where((q) => q.whereNull('fecha_fin').orWhere('fecha_fin', '>=', fecha))
        .first()
    if (!contrato) throw httpError(404, 'No tienes un contrato activo')

    // Consultar marcación del día
    const marcacion = await baseQuery()
        .where('m.idcontrato', contrato.idcontrato)
        .where('m.fecha', fecha)
        .first()
    res.json({ fecha, marcacion: marcacion || null})
}

// ELIMINAR MARCACIÓN
exports.remove = async (req, res) => {
    const eliminado = await db('marcaciones')
        .where({ idmarcacion: req.params.id })
        .del()
    if (!eliminado) { throw httpError(404, 'Marcación no encontrada') }
    res.json({ message: 'Marcación eliminada correctamente' })
}
