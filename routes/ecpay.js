const { Router } = require('express')
const router = Router()

const { ecpayController } = require('../controllers')

// 簡訊
router.get('/payment', ecpayController.payment)
router.post('/payment/result', ecpayController.paymentResult)
router.get('/store/list', ecpayController.getStoreList)
router.get('/store/express-map', ecpayController.getStore)
router.post('/store/express-map/result', ecpayController.getStoreResult)

module.exports = router
