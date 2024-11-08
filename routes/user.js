const { Router } = require('express')
const router = Router()

const { userController } = require('../controllers')

const { checkId, jwtAuth, upload } = require('../middlewares')

const storageType = process.env.STORAGE_TYPE || 'local'

// 驗證參數 userId
router.param('userId', checkId)
router.param('productId', checkId)

router.put('/', jwtAuth, upload(storageType), userController.putUserImage)
router.get('/find/:userInfo', userController.findUserByInfo)
router.put('/:userId', jwtAuth, userController.putUser)
router.put('/pwd/:userInfo', userController.putPwdByInfo)
router.post('/role', jwtAuth, userController.postUserRole)
router.post('/cart/:productId', jwtAuth, userController.postUserCart)
router.put('/cart/:productId', jwtAuth, userController.putUserCart)
router.delete('/cart/:productId', jwtAuth, userController.deleteUserCart)

module.exports = router
