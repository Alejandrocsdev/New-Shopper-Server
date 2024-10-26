const { Router } = require('express')
const router = Router()

const { notifController } = require('../controllers')

// 簡訊
router.post('/reset/pwd/phone', notifController.resetPwdPhone)
router.post('/reset/pwd/email', notifController.resetPwdEmail)

module.exports = router
