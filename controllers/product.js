// 引用 Models
const { Product, Image, User } = require('../models')
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

  getProducts = asyncError(async (req, res) => {
    const limit = parseInt(req.query.limit) || 9
    const page = parseInt(req.query.page) || 1
    const offset = (page - 1) * limit

    // findAndCountAll + scope => wrong count

    const count = await Product.count()

    const products = await Product.findAll({
      limit,
      offset,
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['link']
        },
        {
          model: User,
          as: 'user',
          attributes: ['username']
        }
      ]
    })

    res.status(200).json({
      message: '取得商品成功 (多頁)',
      data: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products
      }
    })
  })

  getProduct = asyncError(async (req, res) => {
    const { productId } = req.params
    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['link']
        }
      ]
    })
    if (!product) throw new CustomError(400, 'error.productNotFound', '查無商品')

    res.status(200).json({ message: '取得商品成功 (單一)', product })
  })
}

module.exports = new ProductController()
