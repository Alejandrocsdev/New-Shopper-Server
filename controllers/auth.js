// 引用 Models
const { User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 引用 加密 模組
const { encrypt } = require('../utils')
// const { encrypt, cookie } = require('../utils')
// 需驗證Body路由 (validate)
const v = {
  phone: ['signUp'],
  password: ['signUp']
}
// Body驗證條件
const schema = (route) => {
  return Joi.object({
    phone: v['phone'].includes(route)
      ? Joi.string().regex(/^09/).length(10).required()
      : Joi.forbidden(),
    password: v['password'].includes(route)
      ? Joi.string().min(8).max(16).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).required()
      : Joi.forbidden()
  })
}

class AuthController extends Validator {
  constructor() {
    super(schema)
  }

  signUp = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'signUp')
    const { phone, password } = req.body

    const [username, hashedPassword] = await Promise.all([
      encrypt.uniqueUsername(User),
      encrypt.hash(password)
    ])

    const user = await User.create({ username, password: hashedPassword, phone })

    // 刪除敏感資料
    const newUser = user.toJSON()
    delete newUser.password

    res.status(201).json({ message: '新用戶註冊成功', user: newUser })
  })
}

module.exports = new AuthController()
