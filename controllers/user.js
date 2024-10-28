// 引用 Models
const { User, Image } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用自定驗證模組
const Validator = require('../Validator')
// 引用 加密 模組
const { encrypt } = require('../utils')
// 上傳/刪除照片
const { uploadImage, deleteImage } = require('../storage')
// 照片存儲類型(local/imgur/cloudinary)
const storageType = process.env.STORAGE_TYPE || 'local'
// 需驗證Body路由
const rules = {
  putPwdByInfo: ['password']
}

class UserController extends Validator {
  constructor() {
    super(rules)
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

  putUser = asyncError(async (req, res, next) => {
    const { user } = req

    if (!user) throw new CustomError(401, 'error.signInAgain', '用戶授權失敗')

    const { file } = req

    // 本地存儲才有第三參數: { entityType, entityId, deleteData  }
    const image = await uploadImage(file, storageType, {
      entityType: 'user',
      entityId: user.id,
      deleteData: user.avatar.deleteData
    })

    const { link, deleteData } = image || {}

    const imageRecord = await Image.findOne({ where: { entityId: user.id, entityType: 'user' } })

    if (imageRecord) {
      await Image.update({ link, deleteData }, { where: { entityId: user.id, entityType: 'user' } })
    } else {
      await Image.create({ link, deleteData, entityId: user.id, entityType: 'user' })
    }

    // await Image.upsert({ link, deleteData, entityId: user.id, entityType: 'user' })

    res.status(200).json({ message: '用戶資料更新成功', link })
  })
}

module.exports = new UserController()
