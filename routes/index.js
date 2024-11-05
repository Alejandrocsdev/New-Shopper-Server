const { Router } = require('express')
const router = Router()

const { jwtAuth } = require('../middlewares')

const auth = require('./auth')
const user = require('./user')
const verif = require('./verif')
const notif = require('./notif')
const ecpay = require('./ecpay')
const store = require('./store')

router.use('/auth', auth)

router.use('/user', user)
router.use('/verif', verif)
router.use('/notif', notif)
router.use('/ecpay', ecpay)
router.use('/store', store)

// router.use('/user', jwtAuth, user)
// router.use('/verif', jwtAuth, verif)
// router.use('/notif', jwtAuth, notif)
// router.use('/ecpay', jwtAuth, ecpay)
// router.use('/store', jwtAuth, store)

module.exports = router
