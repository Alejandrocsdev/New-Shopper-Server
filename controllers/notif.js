// 引用 Models
const { User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 引用 成功回應 / 時間 模組
const { time } = require('../utils')
// 引用自定義驗證模組
const Validator = require('../Validator')
// 客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 發送器模組 (信箱 / 電話)
const sendSMS = require('../config/phone')
const sendMail = require('../config/email')
const smsType = process.env.SMS_TYPE
// 需驗證Body路由
const rules = {
  resetPwdPhone: ['phone'],
  resetPwdEmail: ['email']
}

class NotifyController extends Validator {
  constructor() {
    super(rules)
  }

  resetPwdPhone = asyncError(async (req, res) => {
    // 驗證請求主體
    this.validateBody(req.body, 'resetPwdPhone')
    const { phone } = req.body

    // 取得用戶資料
    const user = await User.findOne({ where: { phone } })

    // 如電話不存在,無法重設密碼
    if (!user) throw new CustomError(400, 'error.unsignedPhone', '未註冊電話號碼')

    // 簡訊內容資料
    // const username = user.username
    const date = time.notifyDate()

    // 發送簡訊
    await sendSMS({ phone, date }, 'notify', smsType)
    // 成功回應
    res.status(200).json({ message: `密碼變更通知寄出成功 (${smsType})` })
  })

  resetPwdEmail = asyncError(async (req, res) => {
    // 驗證請求主體
    this.validateBody(req.body, 'resetPwdEmail')
    const { email } = req.body

    // 取得用戶資料
    const user = await User.findOne({ where: { email } })

    // 如Email不存在,無法重設密碼
    if (!user) throw new CustomError(400, 'error.unsignedEmail', '未註冊電子信箱')

    // 信箱內容資料
    const username = user.username
    const date = time.notifyDate()

    // 發送信箱
    await sendMail({ email, username, date }, 'notify')
    // 成功回應
    res.status(200).json({ message: '密碼變更通知寄出成功 (gmail)' })
  })
}

module.exports = new NotifyController()
