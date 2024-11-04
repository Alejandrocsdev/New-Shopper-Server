const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

const { checkId, jwtAuth, upload } = require('../middlewares')

const storageType = process.env.STORAGE_TYPE || 'local'

// 驗證參數 userId
router.param('userId', checkId)

router.put('/', jwtAuth, upload(storageType), userController.putUserImage)
router.get('/find/:userInfo', userController.findUserByInfo)
router.put('/:userId', userController.putUser)
router.put('/pwd/:userInfo', userController.putPwdByInfo)

module.exports = router
