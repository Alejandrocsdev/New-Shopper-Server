// 引用 Passport-Facebook 模組
const { Strategy } = require('passport-facebook')
// 引用 Models
const { User, Image } = require('../../models')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')
// 引用 工具
const { encrypt, backUrl } = require('../../utils')

// 客製化設定avatar
const settings = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${backUrl}/auth/sign-in/facebook/callback`,
  profileFields: ['id', 'displayName', 'emails', 'photos']
}

// 驗證函式
const verifyCallback = async (accessToken, refreshToken, profile, cb) => {
  try {
    // 取得 Facebook 資料中的 email
    const email = profile.emails[0]?.value || null
    if (!email) throw new CustomError(400, 'error.facebookSignInFail', '無法取得使用者臉書電子郵件')

    const facebookId = profile.id
    const avatar = profile.photos[0]?.value || null

    // (1)檢查是否註冊過臉書-id
    let user = await User.findOne({
      where: { facebookId },
      include: [{ model: Image, as: 'avatar', attributes: ['link', 'deleteData'] }]
    })

    if (!user) {
      // (2)檢查是否註冊過臉書-email
      user = await User.findOne({ 
        where: { email, facebookId: null },
        include: [{ model: Image, as: 'avatar', attributes: ['link', 'deleteData'] }]
      })

      // (3)更新facebookId，並在需要時更新avatar
      if (user) {
        await user.update({ facebookId })
        // 保留現有avatar或更新為Facebook的avatar
        await Image.update(
          {
            link: user.avatar.link || avatar,
            deleteData: user.avatar.deleteData || 'fb'
          },
          { where: { entityId: user.id, entityType: 'user' } }
        )
      }
    }

    if (!user) {
      const username = await encrypt.uniqueUsername(User)
      user = await User.create({ username, email, facebookId })
      await Image.create({ link: avatar, deleteData: 'fb', entityId: user.id, entityType: 'user' })
    }

    // 傳遞驗證成功的用戶資料
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}

// 定義 Facebook 策略
const facebookStrategy = new Strategy(settings, verifyCallback)

module.exports = facebookStrategy
