const { Router } = require('express')
const router = Router()

const { productController } = require('../controllers')

const { checkId } = require('../middlewares')

// 驗證參數 productId
router.param('productId', checkId)

router.get('/all', productController.getProducts)
router.get('/:productId', productController.getProduct)

module.exports = router
