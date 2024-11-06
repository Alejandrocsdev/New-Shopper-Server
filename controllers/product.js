// 引用 Models
const { Product } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 需驗證Body路由
const rules = {
  getProducts: []
}

class ProductController extends Validator {
  constructor() {
    super(rules)
  }

  getProducts = asyncError(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 9
    const page = parseInt(req.query.page) || 1
    const offset = (page - 1) * limit

    const { count, rows: products } = await Product.findAndCountAll({
      limit,
      offset
    })

    res.status(200).json({
      message: '取得商品成功',
      data: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products,
      }
    })
  })
}

module.exports = new ProductController()
