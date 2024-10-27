// 引用 Passport 模組
const passport = require('passport')

// 策略
const localStrategy = require('./local')
const smsStrategy = require('./sms')
const facebookStrategy = require('./facebook')

// 使用策略
passport.use('local', localStrategy)
passport.use('sms', smsStrategy)
passport.use('facebook', facebookStrategy)

// Passport 初始化
const passportInit = passport.initialize()

// 密碼登入驗證 / 簡訊登入驗證
const pwdSignInAuth = passport.authenticate('local', { session: false })
const smsSignInAuth = passport.authenticate('sms', { session: false })
const facebookSignInAuth = passport.authenticate('facebook', { session: false, scope: ['email'] })

module.exports = { passportInit, pwdSignInAuth, smsSignInAuth, facebookSignInAuth }
