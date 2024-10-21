const { Router } = require('express')
const router = Router()

const verif = require('./verif')

router.use('/verif', verif)

module.exports = router
