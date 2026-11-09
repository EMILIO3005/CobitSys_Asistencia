const router = require('express').Router()
const c = require('../controllers/marcacion.controller')

router.get('/', c.listar)
router.get('/:id', c.obtenerPorId)
router.post('/', c.crear)
router.put('/:id', c.actualizar)
router.delete('/:id', c.eliminar)

module.exports = router
