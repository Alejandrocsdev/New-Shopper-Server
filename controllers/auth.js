// 引用 Models
const { User, Role } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用 工具
const { encrypt, cookie, frontUrl } = require('../utils')
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

    if (!cookies?.jwt) throw new CustomError(401, 'error.signInAgain', '查無刷新憑證')

    const refreshToken = cookies.jwt

    const user = await User.findOne({ where: { refreshToken } })

    const { id } = encrypt.verifyToken(refreshToken, 'rt')
    if (!user || id !== user.id) throw new CustomError(403, 'error.signInAgain', '存取憑證刷新失敗')

    const { roles } = user
    if (!roles) throw new CustomError(403, 'error.signInAgain', '查無權限角色')

    const accessToken = encrypt.signAccessToken(id, roles)

    res.status(200).json({ message: '存取憑證刷新成功', accessToken })
  })

  autoSignIn = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const user = await User.findByPk(userId)
    if (!user) throw new CustomError(400, 'error.autoSignInFail', '自動登入失敗')

    const refreshToken = encrypt.signRefreshToken(userId)
    await User.update({ refreshToken }, { where: { id: userId } })
    cookie.store(res, refreshToken)

    const { roles } = user
    if (!roles) throw new CustomError(403, 'error.signInAgain', '查無權限角色')

    const accessToken = encrypt.signAccessToken(userId, roles)
    res.status(200).json({ message: '自動登入成功', accessToken })
  })

  signIn = asyncError(async (req, res, next) => {
    const { user } = req

    if (!user) throw new CustomError(401, 'error.signInFail', '登入失敗')

    const refreshToken = encrypt.signRefreshToken(user.id)
    await User.update({ refreshToken }, { where: { id: user.id } })
    cookie.store(res, refreshToken)

    const { roles } = user
    if (!roles) throw new CustomError(403, 'error.signInAgain', '查無權限角色')

    const accessToken = encrypt.signAccessToken(user.id, roles)
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

    const [user, buyerRole] = await Promise.all([
      User.create({ username, password: hashedPassword, phone }),
      Role.findOne({ where: { name: 'buyer' } })
    ])

    if (buyerRole) {
      await user.addRole(buyerRole)
    } else {
      throw new CustomError(500, 'error.roleNotFound', '無法找到買家角色')
    }

    // 刪除敏感資料
    const newUser = user.toJSON()
    delete newUser.password

    res.status(201).json({ message: '新用戶註冊成功', user: newUser })
  })

  signOut = asyncError(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
      return res.status(200).json({ message: '登出成功' })
    }

    const refreshToken = cookies.jwt
    const user = await User.findOne({ where: { refreshToken } })

    cookie.clear(res)

    if (user) {
      await User.update({ refreshToken: null }, { where: { id: user.id } })
    }

    res.status(200).json({ message: '登出成功' })
  })

  getAuthUser = asyncError(async (req, res, next) => {
    const { user } = req

    res.status(200).json({ message: '取得用戶資料成功', user })
  })

  thirdPartySign = asyncError(async (req, res, next) => {
    const { user } = req

    if (!user) throw new CustomError(401, 'error.signInFail', '登入失敗')

    const refreshToken = encrypt.signRefreshToken(user.id)
    await User.update({ refreshToken }, { where: { id: user.id } })
    cookie.store(res, refreshToken)

    res.redirect(`${frontUrl}`)
  })
}

module.exports = new AuthController()
