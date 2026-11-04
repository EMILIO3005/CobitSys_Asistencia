const router = require('express').Router()
const c = require('../controllers/usuario.controller')



router.get('/', c.list)
router.get('/:id', c.get)
router.post('/', c.create)
router.put('/', c.update)
router.delete('/:id', c.remove)

module.exports = router