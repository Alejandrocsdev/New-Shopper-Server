const { Router } = require('express')
const router = Router()

const user = require('./user')
const verif = require('./verif')

router.use('/user', user)
router.use('/verif', verif)

module.exports = router
