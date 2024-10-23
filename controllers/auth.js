// 引用 Models
const { User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用 加密 模組
const { encrypt, cookie } = require('../utils')
// 需驗證Body路由
const rules = {
  signUp: ['phone', 'password']
}

class AuthController extends Validator {
  constructor() {
    super(rules)
  }

  refresh = asyncError(async (req, res, next) => {
    const cookies = req.cookies

    if (!cookies?.jwt) throw new CustomError(401, 'error.noRefreshToken', '查無刷新憑證')

    const refreshToken = cookies.jwt

    const user = await User.findOne({ where: { refreshToken } })

    const { id } = encrypt.verifyToken(refreshToken, 'rt')

    if (user || id !== user.id) throw new CustomError(403, 'error.tokenRefreshFail', '存取憑證刷新失敗')

    const accessToken = encrypt.signAccessToken(id)

    res.status(200).json({ message: '存取憑證刷新成功', accessToken })
  })

  autoSignIn = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const user = await User.findByPk(userId)
    if (!user) throw new CustomError(400, 'error.autoSignInFail', '自動登入失敗')

    const refreshToken = encrypt.signRefreshToken(userId)
    await User.update({ refreshToken }, { where: { id: userId } })
    cookie.store(res, refreshToken)

    const accessToken = encrypt.signAccessToken(userId)
    res.status(200).json({ message: '自動登入成功', accessToken })
  })

  signIn = asyncError(async (req, res, next) => {
    const { user } = req

    if (!user) throw new CustomError(401, 'error.pwdSignInFail', '密碼登入失敗')

    const refreshToken = encrypt.signRefreshToken(user.id)
    await User.update({ refreshToken }, { where: { id: user.id } })
    cookie.store(res, refreshToken)

    const accessToken = encrypt.signAccessToken(user.id)
    res.status(200).json({ message: '登入成功', accessToken })
  })

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
