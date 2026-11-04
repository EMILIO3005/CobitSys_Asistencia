const router = require('express').Router()
const c = require('../controllers/auth.controller')//Controlador controla permisos
const {verifyToken} = require('../middlewares/auth')
const { loginLimiter } = require('../middlewares/rateLimit')


//¿En un login que verbo usar?
//POST (enviamos un paquete, proteccion)

//router.verbo('ruta', controlador.accion)
//router.verbo('ruta', token, controlador.accion)
router.post('/login', loginLimiter, c.login)
router.post('/logout', c.logout)
router.get('/me', verifyToken, c.me)

module.exports = router