const { Router } = require('express')
const router = Router()

const { storeController } = require('../controllers')

const { jwtAuth } = require('../middlewares')

const { checkId } = require('../middlewares')

// 驗證參數 userId
router.param('storeId', checkId)

router.delete('/:storeId', jwtAuth, storeController.deleteStore)
router.put('/:storeId/default', jwtAuth, storeController.putStoreDefault)

module.exports = router
