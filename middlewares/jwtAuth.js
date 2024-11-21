// 引用 Models
const { User } = require('../models')
// 引用 加密 / 前端網域 模組
const { encrypt } = require('../utils')
// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

// 憑證驗證
const jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new CustomError(401, 'error.signInAgain', '(1)未提供認證標頭')

    const token = authHeader.split(' ')[1]
    if (!token) throw new CustomError(401, 'error.signInAgain', '(2)未提供存取憑證')

    const payload = encrypt.verifyToken(token, 'at')
    if (!payload || !payload.id) throw new CustomError(401, 'error.signInAgain', '(3)無效的憑證數據')

    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) throw new CustomError(401, 'error.signInAgain', '(4)存取憑證已過期')

    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'username', 'email', 'phone', 'usernameModified']
    })
    if (!user) throw new CustomError(403, 'error.signInAgain', '(5)查無用戶')

    req.user = user.toJSON()
    req.rawUser = user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = jwtAuth
