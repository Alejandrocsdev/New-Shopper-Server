const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

const { jwtAuth } = require('../config/passport')

router.get('/find/:userInfo', userController.findUserByInfo)
router.put('/pwd/:userInfo', userController.putPwdByInfo)
router.get('/me', jwtAuth, userController.getAuthUser)

module.exports = router
