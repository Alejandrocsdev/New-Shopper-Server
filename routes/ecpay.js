const { Router } = require('express')
const router = Router()

const { ecpayController } = require('../controllers')

// 簡訊
router.get('/payment', ecpayController.payment)
router.post('/payment/result', ecpayController.paymentResult)
router.get('/store/list', ecpayController.getStoreList)
router.get('/store/express-map', ecpayController.getStore)
router.post('/store/express-map/result', ecpayController.getStoreResult)
router.post('/envoice/gov-invoice-type', ecpayController.getInvoiceType)
router.post('/envoice/add-invoice-type', ecpayController.addInvoiceType)
router.post('/envoice/set-invoice-type', ecpayController.setInvoiceType)
router.post('/envoice/get-invoice', ecpayController.getInvoice)
router.post('/envoice/issue', ecpayController.issueInvoice)
router.post('/envoice/issue-print', ecpayController.invoicePrint)

module.exports = router
