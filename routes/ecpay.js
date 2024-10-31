const { Router } = require('express')
const router = Router()

const { ecpayController } = require('../controllers')

// 簡訊
router.get('/payment', ecpayController.payment)
router.post('/payment/result', ecpayController.paymentResult)

module.exports = router
