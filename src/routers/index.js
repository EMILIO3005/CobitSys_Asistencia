const router = require('express').Router()

//const { use } = require('react')
//JWT = limitar el uso de las rutas
const {verifyToken, requireLevel} = require('../middlewares/auth')


//Rutas App(Expandiendo segun modulos)
//Version 1: login (publico)
router.use('/auth', require('./auth.routes'))
router.use('/personas', verifyToken, require('./persona.routes'))
router.use('/usuarios', verifyToken, requireLevel('ADMIN'), require('./usuario.routes'))
router.use('/sedes', verifyToken, requireLevel('ADMIN'), require('./sede.routes'))
router.use('/areas', verifyToken, require('./area.routes'))
router.use('/cargos', verifyToken, requireLevel('ADMIN'), require('./cargo.routes'))
router.use('/horarios', verifyToken, requireLevel('ADMIN'), require('./horario.routes'))
router.use('/marcaciones', verifyToken, require('./marcacion.routes'))
router.use('/empleados', verifyToken, requireLevel('ADMIN'), require('./empleado.routes'))
module.exports = router