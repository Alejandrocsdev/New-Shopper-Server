const { Router } = require('express')
const router = Router()

const { productController } = require('../controllers')

router.get('/all', productController.getProducts)

module.exports = router
