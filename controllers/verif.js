// 引用 Models
const { Otp, User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用 加密 模組
const { encrypt, backUrl, frontUrl } = require('../utils')
// 發送器模組 (電話 / Email)
const sendMail = require('../config/email')
const sendSMS = require('../config/phone')
const smsType = process.env.SMS_TYPE
// 需驗證Body路由
const rules = {
  sendOtp: ['phone', 'isReset'],
  verifyOtp: ['phone', 'otp'],
  sendLink: ['email', 'lang']
}

class VerifController extends Validator {
  constructor() {
    super(rules)
  }

  sendOtp = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'sendOtp')
    // isReset: 是否為重設密碼
    const { phone, isReset } = req.body

    // 生成OTP
    const otp = encrypt.otp()

    // 確認用戶存在 / OTP 加密
    const [user, hashedOtp] = await Promise.all([
      User.findOne({ where: { phone } }),
      encrypt.hash(otp)
    ])

    if (isReset) {
      // 1. 如電話不存在,無法重設密碼
      // 2. 如是註冊,電話存在與否都會嘗試發送OTP
      if (!user) throw new CustomError(400, 'error.unsignedPhone', '未註冊電話號碼')
    }

    // OTP 有效期限(15分鐘)
    const expireTime = Date.now() + 15 * 60 * 1000
    // 查詢OTP紀錄, 不存在則新增
    const [otpRecord, created] = await Otp.findOrCreate({
      where: { phone },
      defaults: { phone, otp: hashedOtp, expireTime }
    })

    // 如果 OTP 記錄已存在，更新 OTP 和 expireTime
    if (!created) {
      await otpRecord.update({ otp: hashedOtp, expireTime, attempts: 0 })
    }

    // 發送簡訊
    await sendSMS({ phone, otp }, 'verify', smsType)
    console.log(`簡訊OTP發送成功 (${smsType})`)
    // 成功回應
    res.status(200).json({ message: `簡訊OTP發送成功 (${smsType})` })
  })

  verifyOtp = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'verifyOtp')
    const { phone, otp } = req.body

    // 讀取單一資料
    const otpRecord = await Otp.findOne({ where: { phone } })
    // 驗證 OTP 是否存在
    if (!otpRecord) throw new CustomError(400, 'error.phoneNoOtpRecord', '此電話沒有發送OTP紀錄')

    const { otp: hashedOtp, expireTime, attempts } = otpRecord

    const newAttempts = attempts + 1

    // 驗證 OTP 是否正確
    const isMatch = await encrypt.hashCompare(otp, hashedOtp)

    // 刪除Otp資訊: OTP 正確 / OTP 失效 / 嘗試次數過多
    if (isMatch || expireTime <= Date.now() || newAttempts > 5) {
      // 刪除Otp資訊
      await Otp.destroy({ where: { phone } })

      // OTP 正確
      if (isMatch) {
        res.status(200).json({ message: `簡訊OTP驗證成功 (${smsType})` })
      }
      // OTP 失效
      else if (expireTime <= Date.now()) {
        throw new CustomError(401, 'error.otpExpired', 'OTP過期')
      }
      // 嘗試次數過多
      else if (newAttempts > 5) {
        throw new CustomError(429, 'error.tooManyAttempts', '輸入錯誤達5次')
      }
    }
    // 未達嘗試限制: 更新嘗試次數
    else {
      // 更新Otp資訊
      await Otp.update({ attempts: newAttempts }, { where: { phone } })

      throw new CustomError(401, 'error.invalidOtp', 'OTP無效')
    }
  })

  sendLink = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, 'sendLink')
    const { email, lang } = req.body

    // 取得用戶資料
    const user = await User.findOne({ where: { email } })

    // 如Email不存在,無法重設密碼
    if (!user) throw new CustomError(400, 'error.unsignedEmail', '未註冊電子信箱')

    // 信箱內容資料
    const username = user.username
    const token = encrypt.signEmailToken(user.id)
    const link = `${backUrl}/verif/verify/link?token=${token}&lang=${lang}`

    // 發送信箱
    await sendMail({ email, username, link }, 'verify')
    // 成功回應
    res.status(200).json({ message: '信箱OTP發送成功 (gmail)' })
  })

  verifyLink = asyncError(async (req, res, next) => {
    const { token, lang } = req.query

    // 導向前端連結
    const url = (verified, data) => {
      const query = verified ? 'email' : 'message'
      return `${frontUrl}/${lang}/reset?verified=${verified}&${query}=${data}`
    }

    try {
      const { id } = encrypt.verifyToken(token, 'email')
      const user = await User.findByPk(id)

      if (!user) res.redirect(url(false, 'error.unsignedEmail'))

      // 成功回應
      res.redirect(url(true, user.email))
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        res.redirect(url(false, 'linkExpired'))
      } else {
        res.redirect(url(false, 'linkInvalid'))
      }
    }
  })
}

module.exports = new VerifController()
