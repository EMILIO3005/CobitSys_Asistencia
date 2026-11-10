const jwt = require('jsonwebtoken')
const db = require('../config/db')

//No se exporta, porque colabora con verifyToken

//Error 1 -> No autorizado
//Error 2 -> Expirado
const unauthorized = (res, msg = 'No autorizado') => {
  res.status(401).json({ message: msg})
}

//Token = firma, permiso, dato encriptado
//funciones definidas como asincronas llevan promesa
exports.verifyToken = async (req, res, next) => {
  
  //Archivos que guardan la configuracion
  //NOTA: en tu navegador  INSPECCIONAR > RED
  const token = req.cookies.token

  //si no existe token no puedes acceder a la app
  if (!token) { return unauthorized(res) }

  //Existe token
  //JWT = 3 partes
  let payload

  //Manejador de excepciones
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch (e) {
    return unauthorized(res, 'Sesión ya inválida o expirado')
  }

  //Se consulta al a BD para respetar usuarios desactivados

  const user = await db("usuarios").where({ idusuario : payload.idusuario })
  .select('idusuario', 'idpersona', 'nombre_usuario', 'nivel_acceso', 'estado').first()

  if (!user || !user.estado){
    return unauthorized(res, 'Usuario inactivo o inexistente')
  }

  req.user = user;
  next()
}

exports.requireLevel = (...niveles) => (req, res, next) => {
  niveles.includes(req.user.nivel_acceso) ? 
  next() : 
  res.status(403)
  .json({ message: 'No tienes permiso para esta accion' })
}