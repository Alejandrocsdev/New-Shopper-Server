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
// 需驗證Body路由
const v = {
  password: ['putPwdByInfo']
}
// Body驗證條件
const schema = (route) => {
  return Joi.object({
    password: v['password'].includes(route)
      ? Joi.string().min(8).max(16).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).required()
      : Joi.forbidden()
  })
}

class UserController extends Validator {
  constructor() {
    super(schema)
  }

  findUserByInfo = asyncError(async (req, res, next) => {
    const { userInfo } = req.params
    console.log(userInfo)

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
    res.status(200).json({ message: '密碼更新成功' })
  })
}

module.exports = new UserController()
