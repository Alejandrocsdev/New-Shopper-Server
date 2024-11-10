const { Router } = require('express')
const router = Router()

const { ecpayController } = require('../controllers')

router.get('/payment/params', ecpayController.paymentParams)
router.post('/payment/result', ecpayController.paymentResult) // ReturnURL
router.post('/payment/order', ecpayController.getPaymentOrder)

router.get('/logisticts/store/params', ecpayController.getStoreParams)
router.post('/logisticts/store/result', ecpayController.getStoreResult) // ServerReplyURL

router.post('/einvoice/get-gov-word-setting', ecpayController.getGovWordSetting)
router.post('/einvoice/add-word-setting', ecpayController.addWordSetting)
router.post('/einvoice/set-word-status', ecpayController.setWordStatus)
router.post('/einvoice/get-word-setting', ecpayController.getWordSetting)

router.post('/einvoice/issue', ecpayController.issueInvoice)
router.post('/einvoice/print', ecpayController.printInvoice)
router.post('/einvoice/get-issue', ecpayController.getIssue)

// router.get('/logisticts/store/list/params', ecpayController.getStoreListParams)

module.exports = router
