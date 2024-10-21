// 引用 Models
const { Otp, User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 引用 加密 模組
const { encrypt, backUrl, frontUrl } = require('../utils')
// 發送器模組 (電話)
const sendSMS = require('../config/phone')
const smsType = process.env.SMS_TYPE
// 需驗證Body路由
const v = {
  phone: ['sendOtp'],
  isReset: ['sendOtp']
}
// Body驗證條件
const schema = (route) => {
  return Joi.object({
    phone: v['phone'].includes(route)
      ? Joi.string().regex(/^09/).length(10).required()
      : Joi.forbidden(),
    isReset: v['isReset'].includes(route) 
      ? Joi.boolean().default(false) 
      : Joi.forbidden()
  })
}

class VerifController extends Validator {
  constructor() {
    super(schema)
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
}

module.exports = new VerifController()
