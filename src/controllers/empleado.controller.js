const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { httpError, requireFields, isEmail, checkCredentials } = require('../utils')

// CAMPOS PERMITIDOS
const camposPersona = [
    'apellidos', 'nombres', 'tipodoc',
    'numdoc', 'fechanac', 'direccion',
    'telefono', 'email'
]

const camposContrato = [
    'idcargo', 'idsede', 'modalidad',
    'fecha_inicio', 'fecha_fin', 'estado'
]

// FILTRAR CAMPOS
const pick = (body, campos) => Object.fromEntries(
    campos.filter(key => key in body).map(key => [
        key,
        typeof body[key] === 'string' ? body[key].trim() : body[key]
    ])
)

// VALIDAR DATOS DEL EMPLEADO
const validarEmpleado = (persona, contrato) => {

    if (!isEmail(persona.email)) throw httpError(400, 'El email no es válido')
    if (!['PRESENCIAL', 'REMOTO'].includes(contrato.modalidad))  throw httpError(400, 'La modalidad no es válida')
    if (contrato.fecha_fin && contrato.fecha_fin < contrato.fecha_inicio) throw httpError(400, 'La fecha de fin no puede ser anterior a la fecha de inicio')
    
    contrato.idcargo = Number(contrato.idcargo)
    contrato.idsede = Number(contrato.idsede)
    if (!Number.isInteger(contrato.idcargo) || contrato.idcargo <= 0 ||
        !Number.isInteger(contrato.idsede) || contrato.idsede <= 0) {
        throw httpError(400, 'El cargo o la sede seleccionados no son válidos')
    }
}

// VERIFICAR CARGO Y SEDE
const validarAsignaciones = async (trx, contrato) => {
    const cargo = await trx('cargos')
        .where({ idcargo: contrato.idcargo, estado: true })
        .first()

    if (!cargo) throw httpError(404, 'El cargo no existe o está inactivo')
    const sede = await trx('sedes')
        .where({ idsede: contrato.idsede, estado: true })
        .first()
    if (!sede) throw httpError(404, 'La sede no existe o está inactiva')
}
// LISTAR EMPLEADOS
exports.list = async (req, res) => {
    const empleados = await db('contratos as c')
        .join('personas as p', 'c.idpersona', 'p.idpersona')
        .join('usuarios as u', 'p.idpersona', 'u.idpersona')
        .join('cargos as ca', 'c.idcargo', 'ca.idcargo')
        .join('sedes as s', 'c.idsede', 's.idsede')
        .select(
            'p.idpersona',
            'p.apellidos',
            'p.nombres',
            'p.tipodoc',
            'p.numdoc',
            'p.fechanac',
            'p.direccion',
            'p.telefono',
            'p.email',
            'u.idusuario',
            'u.nombre_usuario',
            'u.nivel_acceso',
            'c.idcontrato',
            'c.idcargo',
            'c.idsede',
            'ca.nombre_cargo',
            's.nombre_sede',
            'c.modalidad',
            'c.fecha_inicio',
            'c.fecha_fin',
            'c.estado'
        )
        .orderBy('p.apellidos', 'asc')
    res.json(empleados)
}

// OBTENER EMPLEADO POR ID DE CONTRATO
exports.get = async (req, res) => {
    const empleado = await db('contratos as c')
        .join('personas as p', 'c.idpersona', 'p.idpersona')
        .join('usuarios as u', 'p.idpersona', 'u.idpersona')
        .join('cargos as ca', 'c.idcargo', 'ca.idcargo')
        .join('sedes as s', 'c.idsede', 's.idsede')
        .where('c.idcontrato', req.params.id)
        .select(
            'p.idpersona',
            'p.apellidos',
            'p.nombres',
            'p.tipodoc',
            'p.numdoc',
            'p.fechanac',
            'p.direccion',
            'p.telefono',
            'p.email',
            'u.idusuario',
            'u.nombre_usuario',
            'u.nivel_acceso',
            'c.idcontrato',
            'c.idcargo',
            'c.idsede',
            'ca.nombre_cargo',
            's.nombre_sede',
            'c.modalidad',
            'c.fecha_inicio',
            'c.fecha_fin',
            'c.estado'
        )
        .first()
    if (!empleado) throw httpError(404, 'Empleado no encontrado')
    res.json(empleado)
}
// REGISTRAR EMPLEADO

exports.create = async (req, res) => {
    const persona = pick(req.body, camposPersona)
    const contrato = pick(req.body, camposContrato)

    const {
        nombre_usuario,
        clave_acceso,
        nivel_acceso = 'USUARIO'
    } = req.body

    requireFields(persona, camposPersona)
    requireFields(contrato, ['idcargo', 'idsede', 'modalidad', 'fecha_inicio'])
    requireFields(req.body, ['nombre_usuario', 'clave_acceso'])

    validarEmpleado(persona, contrato)
    checkCredentials(req.body, { claveObligatoria: true })

    if (!['ADMIN', 'USUARIO'].includes(nivel_acceso)) {
        throw httpError(400, 'Nivel de acceso inválido')
    }

    const hash = await bcrypt.hash(clave_acceso, 10)

    const resultado = await db.transaction(async trx => {
        await validarAsignaciones(trx, contrato)

        const [idpersona] = await trx('personas').insert(persona)

        const [idcontrato] = await trx('contratos').insert({
            ...contrato,
            idpersona,
            fecha_fin: contrato.fecha_fin || null,
            estado: contrato.estado === false || contrato.estado === '0'
                ? false
                : true
        })

        const [idusuario] = await trx('usuarios').insert({
            idpersona,
            nombre_usuario,
            clave_acceso: hash,
            nivel_acceso,
            estado: true
        })

        return { idpersona, idcontrato, idusuario }
    })

    res.status(201).json({
        ...resultado,
        message: 'Empleado registrado correctamente'
    })
}

// ACTUALIZAR EMPLEADO
exports.update = async (req, res) => {
    const persona = pick(req.body, camposPersona)
    const contrato = pick(req.body, camposContrato)
    const { nombre_usuario, clave_acceso, nivel_acceso } = req.body
    requireFields(persona, camposPersona)
    requireFields(contrato, ['idcargo', 'idsede', 'modalidad', 'fecha_inicio'])
    requireFields(req.body, ['nombre_usuario', 'nivel_acceso'])

    validarEmpleado(persona, contrato)
    checkCredentials(req.body, { claveObligatoria: false })

    if (!['ADMIN', 'USUARIO'].includes(nivel_acceso)) throw httpError(400, 'Nivel de acceso inválido')
    const resultado = await db.transaction(async trx => {
        const empleado = await trx('contratos as c')
            .join('personas as p', 'c.idpersona', 'p.idpersona')
            .join('usuarios as u', 'p.idpersona', 'u.idpersona')
            .where('c.idcontrato', req.params.id)
            .select(
                'c.idpersona',
                'u.idusuario'
            )
            .first()
        if (!empleado) throw httpError(404, 'Empleado no encontrado')
        await validarAsignaciones(trx, contrato)
        // ACTUALIZAR PERSONA
        await trx('personas')
            .where({ idpersona: empleado.idpersona })
            .update(persona)

        // ACTUALIZAR USUARIO
        const usuario = {nombre_usuario, nivel_acceso}

        if (clave_acceso) { usuario.clave_acceso = await bcrypt.hash(clave_acceso, 10) }
        await trx('usuarios')
            .where({ idusuario: empleado.idusuario })
            .update(usuario)
        // ACTUALIZAR CONTRATO
        await trx('contratos')
            .where({ idcontrato: req.params.id })
            .update({
                ...contrato,
                fecha_fin: contrato.fecha_fin || null,
                estado: contrato.estado === false ||
                 contrato.estado === '0' ? false : true
            })
        return {
            idpersona: empleado.idpersona,
            idusuario: empleado.idusuario,
            idcontrato: Number(req.params.id)
        }
    })

    res.json({ ...resultado, message: 'Empleado actualizado correctamente' })
}

// ELIMINAR EMPLEADO
exports.remove = async (req, res) => {
    await db.transaction(async trx => {
        const empleado = await trx('contratos')
            .where({ idcontrato: req.params.id })
            .select('idpersona')
            .first()
        if (!empleado) throw httpError(404, 'Empleado no encontrado')
        const idpersona = empleado.idpersona
        // VERIFICAR SI TIENE OTROS CONTRATOS
        const otrosContratos = await trx('contratos')
            .where({ idpersona })
            .whereNot('idcontrato', req.params.id)
            .first()
        // ELIMINAR CONTRATO
        await trx('contratos')
            .where({ idcontrato: req.params.id })
            .del()
        // SI TIENE OTROS CONTRATOS, CONSERVAR PERSONA Y USUARIO
        if (otrosContratos) return

        // ELIMINAR USUARIO
        await trx('usuarios')
            .where({ idpersona })
            .del()

        // ELIMINAR PERSONA
        await trx('personas')
            .where({ idpersona })
            .del()
    })
    res.json({ message: 'Empleado eliminado correctamente' })
}
