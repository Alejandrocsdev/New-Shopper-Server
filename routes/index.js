const { Router } = require('express')
const router = Router()

const auth = require('./auth')
const user = require('./user')
const verif = require('./verif')
const notif = require('./notif')
const ecpay = require('./ecpay')

router.use('/auth', auth)
router.use('/user', user)
router.use('/verif', verif)
router.use('/notif', notif)
router.use('/ecpay', ecpay)

module.exports = router
