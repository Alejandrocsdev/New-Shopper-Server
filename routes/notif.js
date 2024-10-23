const { Router } = require('express')
const router = Router()

const { notifController } = require('../controllers')

// 簡訊
router.post('/reset/password/email', notifController.resetCompleteEmail)
router.post('/reset/password/phone', notifController.resetCompletePhone)

module.exports = router
