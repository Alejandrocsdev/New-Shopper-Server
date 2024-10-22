const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

router.get('/find/:userInfo', userController.findUserByInfo)

module.exports = router
