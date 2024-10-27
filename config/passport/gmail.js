// 引用 Passport-Facebook 模組
const { Strategy } = require('passport-google-oauth20')
// 引用 Models
const { User } = require('../../models')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')
// 引用 工具
const { encrypt, backUrl } = require('../../utils')

// 客製化設定
const settings = {
  clientID: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  callbackURL: `${backUrl}/auth/sign-in/gmail/callback`
}

// 驗證函式
const verifyCallback = async (accessToken, refreshToken, profile, cb) => {
  console.log('accessToken', accessToken)
  console.log('refreshToken', refreshToken)
  console.log('profile', profile)
  try {
    // 取得 Gmail 資料中的 email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null
    if (!email) throw new CustomError(400, 'error.gmailSignInFail', '無法取得使用者gmail電子郵件')

    const gmailId = profile.id
    const avatar = profile.photos[0]?.value || null

    // (1)檢查是否註冊過gmail-id
    let user = await User.findOne({ where: { gmailId } })

    if (!user) {
      // (2)檢查是否註冊過gmail-email
      user = await User.findOne({ where: { email, gmailId: null } })

      // (3)更新gmailId，並在需要時更新avatar
      if (user) {
        await user.update({ 
          gmailId, 
          avatar: user.avatar || avatar // 保留現有avatar或更新為Gmail的avatar
        })
      }
    }

    if (!user) {
      const username = await encrypt.uniqueUsername(User)
      user = await User.create({ username, email, gmailId, avatar })
    }

    // 傳遞驗證成功的用戶資料
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}

// 定義 Gmail 策略
const gmailStrategy = new Strategy(settings, verifyCallback)

module.exports = gmailStrategy
