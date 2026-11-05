const bcrypt = require("bcryptjs")
const db = require("../config/db")
const { httpError, requireFields, checkCredentials } = require("../utils")

//Perfiles
const NIVELES = ["ADMIN", "USUARIO"]

const baseQuery = () => {
    return db("usuarios as u").join("personas as p", "p.idpersona", "u.idpersona").select(
        "u.idusuario",
        "u.idpersona",
        "u.nombre_usuario",
        "u.nivel_acceso",
        "u.estado",
        "p.apellidos",
        "p.nombres"
    )
}

const checkNivel = (nivel) => {
    if (nivel !== undefined && !NIVELES.includes(nivel)) {
        throw httpError(400, "Nivel de acceso inválido")
    }
}

//Listar
exports.list = async (req, res) => {
    res.json(await baseQuery().orderBy("u.idusuario"))
}

//Buscar
exports.get = async (req, res) => {
    const row = await baseQuery().where({ "u.idusuario": req.params.id }).first()
    if (!row) throw httpError(404, "Usuario no encontrado")
    res.json(row)
}

//Registrar
exports.create = async (req, res) => {
    requireFields(req.body, ["idpersona", "nombre_usuario", "clave_acceso"])

    const { idpersona, nombre_usuario, clave_acceso, nivel_acceso, estado } = req.body
    checkNivel(nivel_acceso)

    //Verificar credenciales
    checkCredentials(req.body, { claveObligatoria: true })

    const [id] = await db("usuarios").insert({
        idpersona,
        nombre_usuario,
        nivel_acceso,
        estado,
        clave_acceso: await bcrypt.hash(clave_acceso, 10)
    })
    res.status(201).json({ id, message: "Usuario creado correctamente" })
}

//Actualizar
exports.update = async (req, res) => {
    requireFields(req.body, ["idpersona", "nombre_usuario"])
    //Deserializacion
    const { idpersona, nombre_usuario, clave_acceso, nivel_acceso, estado } = req.body

    //Validacion de acceso
    checkNivel(nivel_acceso)
    checkCredentials(req.body, { claveObligatoria: false })

    const data = { idpersona, nombre_usuario}

    //Actualizando el objeto data con el nivel de acceso que ingresa
    if (nivel_acceso){ data.nivel_acceso = nivel_acceso }
    if (estado !== undefined){ data.estado = !!estado }
    if (clave_acceso) { data.clave_acceso = await bcrypt.hash(clave_acceso, 10) }

    const num = await db("usuarios").where({ idusuario: req.params.id }).update(data)
    if (!num) throw httpError(404, "Usuario no encontrado")
    res.json({ message: "Usuario actualizado correctamente" })
}

//Eliminar
exports.remove = async (req, res) => {
    if (Number(req.params.id) === req.user.idusuario) {
        throw httpError(400, "No puede eliminar su propio usuario")
    }

    const num = await db("usuarios").where({ idusuario: req.params.id }).del()
    if (!num) throw httpError(404, "Usuario no encontrado")
    res.json({ message: "Usuario eliminado correctamente" })
}
