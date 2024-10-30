const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

const { jwtAuth, upload } = require('../middlewares')

const storageType = process.env.STORAGE_TYPE || 'local'

router.put('/', jwtAuth, upload(storageType), userController.putUserImage)
router.get('/find/:userInfo', userController.findUserByInfo)
router.put('/pwd/:userInfo', userController.putPwdByInfo)

module.exports = router
