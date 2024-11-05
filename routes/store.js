const { Router } = require('express')
const router = Router()

const { storeController } = require('../controllers')

const { checkId } = require('../middlewares')

// 驗證參數 userId
router.param('storeId', checkId)

router.delete('/:storeId', storeController.deleteStore)
router.put('/:storeId/default', storeController.putStoreDefault)

module.exports = router
