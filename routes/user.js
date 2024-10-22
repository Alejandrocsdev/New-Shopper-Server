const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

router.get('/find/:userInfo', userController.findUserByInfo)
router.put('/pwd/:userInfo', userController.putPwdByInfo)

module.exports = router
