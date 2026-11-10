const router = require('express').Router()
const c = require('../controllers/marcacion.controller')
const {requireLevel} =require('../middlewares/auth')


router.get('/', c.list)
router.get('/:id', c.get)
router.post('/', c.create)
router.put('/:id', requireLevel('ADMIN'), c.update)
router.delete('/:id', requireLevel('ADMIN'), c.remove)

module.exports = router
