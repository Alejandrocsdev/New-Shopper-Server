const { Router } = require('express')
const router = Router()

const auth = require('./auth')
const user = require('./user')
const verif = require('./verif')
const notif = require('./notif')
const ecpay = require('./ecpay')
const store = require('./store')
const product = require('./product')

router.use('/auth', auth)
router.use('/user', user)
router.use('/verif', verif)
router.use('/notif', notif)
router.use('/ecpay', ecpay)
router.use('/store', store)
router.use('/product', product)

module.exports = router
