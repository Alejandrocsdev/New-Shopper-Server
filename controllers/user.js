// 引用 Models
const { User, Image, Role, Cart, CartItem, Product } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用 加密 模組
const { encrypt } = require('../utils')
// 上傳/刪除照片
const { uploadImage, deleteImage } = require('../storage')
// 照片存儲類型(local/imgur/cloudinary)
const storageType = process.env.STORAGE_TYPE || 'local'
// 需驗證Body路由
const rules = {
  putPwdByInfo: ['password'],
  putUser: ['username', 'password', 'email', 'phone']
}

class UserController extends Validator {
  constructor() {
    super(rules)
  }

  findUserByInfo = asyncError(async (req, res, next) => {
    const { userInfo } = req.params

    const infoType = userInfo.split(':')[0] // phone || email
    const info = userInfo.split(':')[1]

    const user = await User.findOne({ where: { [infoType]: info } })

    const userData = user ? user.toJSON() : null

    // 刪除敏感資料
    if (user) delete userData.password

    res.status(200).json({ message: user ? '資料已經註冊' : '資料尚未註冊', user: userData })
  })

  putPwdByInfo = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'putPwdByInfo')
    const { password } = req.body
    const { userInfo } = req.params

    const hashedPassword = await encrypt.hash(password)

    const infoType = userInfo.split(':')[0] // phone || email
    const info = userInfo.split(':')[1]

    await User.update({ password: hashedPassword }, { where: { [infoType]: info } })
    res.status(200).json({ message: '用戶密碼更新成功' })
  })

  putUser = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'putUser')
    const { username, password, email, phone } = req.body
    const { userId } = req.params

    const updateData = {}
    if (username !== null && username !== undefined) {
      updateData.username = username
      updateData.usernameModified = true
    }
    if (password !== null && password !== undefined)
      updateData.password = await encrypt.hash(password)
    if (email !== null && email !== undefined) updateData.email = email
    if (phone !== null && phone !== undefined) updateData.phone = phone

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '無更新資料' })
    }

    await User.update(updateData, { where: { id: userId } })
    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'username', 'email', 'phone', 'usernameModified']
    })

    res.status(200).json({ message: '用戶資料更新成功', user: updatedUser })
  })

  putUserImage = asyncError(async (req, res, next) => {
    const { user } = req

    if (!user) throw new CustomError(401, 'error.signInAgain', '用戶授權失敗')

    const { file } = req

    // 本地存儲才有第三參數: { entityType, entityId, deleteData  }
    const image = await uploadImage(file, storageType, {
      entityType: 'user',
      entityId: user.id
    })

    const { link, deleteData } = image || {}

    const imageRecord = await Image.findOne({ where: { entityId: user.id, entityType: 'user' } })

    if (imageRecord) {
      await Image.update({ link, deleteData }, { where: { entityId: user.id, entityType: 'user' } })
      await deleteImage(imageRecord.deleteData, storageType)
    } else {
      await Image.create({ link, deleteData, entityId: user.id, entityType: 'user' })
    }

    // await Image.upsert({ link, deleteData, entityId: user.id, entityType: 'user' })

    res.status(200).json({ message: '用戶頭像更新成功', link })
  })

  postUserRole = asyncError(async (req, res, next) => {
    const { rawUser } = req

    if (!rawUser) throw new CustomError(401, 'error.signInAgain', '用戶授權失敗')

    const { role } = req.body

    const userRole = await Role.findOne({ where: { name: role } })

    await rawUser.addRole(userRole)

    await rawUser.reload({
      include: {
        model: Role,
        as: 'roles',
        attributes: ['name']
      }
    })

    res.status(200).json({ message: '新增用戶角色', roles: rawUser.roles })
  })

  postUserCart = asyncError(async (req, res, next) => {
    const { user } = req
    if (!user) throw new CustomError(401, 'error.signInAgain', '用戶授權失敗')

    const { productId } = req.params
    const { quantity, unitPrice } = req.body

    const [cart, cartCreated] = await Cart.findOrCreate({
      where: { userId: user.id }
    })

    const [cartItem, itemCreated] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId },
      defaults: {
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      }
    })

    if (!itemCreated) {
      cartItem.quantity += quantity
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice
      await cartItem.save()
    }

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price'],
          include: [
            {
              model: Image,
              as: 'image',
              attributes: ['link']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({ message: '商品加入購物車成功', cartItems })
  })

  deleteUserCart = asyncError(async (req, res, next) => {
    const { user } = req
    if (!user) throw new CustomError(401, 'error.signInAgain', '用戶授權失敗')

    const { productId } = req.params

    const cart = await Cart.findOne({
      where: { userId: user.id }
    })

    await CartItem.destroy({
      where: { cartId: cart.id, productId }
    })

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price'],
          include: [
            {
              model: Image,
              as: 'image',
              attributes: ['link']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({ message: '商品移除購物車成功', cartItems })
  })
}

module.exports = new UserController()
