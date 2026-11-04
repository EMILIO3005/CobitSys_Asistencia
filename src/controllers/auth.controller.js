const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')

const { httpError, requireFields } = require('../utils')


//Cookies
const cookieOpt ={
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
}

//HASH Temporal
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10)


exports.login = async (req, res) => {
    requireFields(req.body, ['nombre_usuario', 'clave_acceso'])
    const { nombre_usuario, clave_acceso } = req.body

    //Validar el tipo de datos
    if (typeof nombre_usuario !== 'string' || typeof clave_acceso !== 'string') {
        throw httpError(400, 'Los campos deben ser de tipo string')
    }

    //Buscar al usuario con el nombre
    const user = await db('usuarios').where({ nombre_usuario }).first()

    //Evaluacion si la clave es correcta
    const valid = await bcrypt.compare(clave_acceso, user ? user.clave_acceso : DUMMY_HASH)

    //Si no existe el usuario OR si existe un estado(false) OR si la clave es incorrecta
    if (!user || !user.estado || !valid) {
        //401 => no autorizado
        throw httpError(401, 'Usuario o clave incorrectos')
    }


    //Habilitamos un permiso JWT (JSON Web Token) para el usuario
    const token = jwt.sign({
        idusuario: user.idusuario,
        nombre_usuario: user.nombre_usuario,
        nivel_acceso: user.nivel_acceso
    }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    })

    res.cookie('token', token, cookieOpt).json({message: 'Bienvenido'})
}

//Cierre de sesión
exports.logout = async (req, res) => {
    res.clearCookie('token', cookieOpt).json({message: 'Sesión cerrada correctamente'})
}

exports.me = async (req, res) => {
    //Consulta multitabla para obtener los datos del usuario y su nivel de acceso
    const usuario = await db('usuarios as u')
        .join('personas as p', 'p.idpersona', 'u.idpersona')
        .where('u.idusuario', req.user.idusuario)
        .select('u.idusuario', 'u.nombre_usuario', 'u.nivel_acceso', 'p.nombres', 'p.apellidos')
        .first()
    
    if (!usuario) throw httpError(404, 'Usuario no encontrado')
    
        //Retornamos los datos del usuario
    res.json(usuario)
}