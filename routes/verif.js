const { Router } = require('express')
const router = Router()

const { verifController } = require('../controllers')

router.post('/send/otp', verifController.sendOtp)

module.exports = router
