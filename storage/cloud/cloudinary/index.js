// 引用 cloudinary SDK
const cloudinary = require('cloudinary').v2
// 引用客製化錯誤訊息模組
const CustomError = require('../../../errors/CustomError')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

class Cloudinary {
  async upload(file) {
    // 檔案不存在停止執行
    if (!file || !file.buffer) return null

    let deleteData = null

    try {
      // const filePath = path.resolve(__dirname, '..', '..', '..', file.path)
      // const data = await cloudinary.uploader.upload(filePath)
      const data = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) {
            reject(new CustomError(500, 'error.uploadImageFail', '上傳至 Cloudinary 失敗'))
          } else {
            resolve(result)
          }
        })
        uploadStream.end(file.buffer)
      })

      const link = data.secure_url
      deleteData = data.public_id

      // fs.unlink(filePath, (err) => {
      //   if (err)
      //     throw new CustomError(
      //       500,
      //       'error.removeTempImageFail',
      //       '移除本地暫存圖檔失敗 (cloudinary)'
      //     )
      // })

      return { link, deleteData }
    } catch (err) {
      console.log(err.message)
      if (deleteData) {
        await cloudinary.uploader.destroy(deleteData)
      }
      throw new CustomError(500, 'error.uploadImageFail', '本地圖檔上傳失敗 (cloudinary)')
    }
  }

  async delete(deletehash) {
    // 來自臉書或Gmail照片無須刪除(從未儲存)
    if (deletehash === 'fb' || deletehash === 'gm') return
    try {
      await cloudinary.uploader.destroy(deletehash)
    } catch (err) {
      console.log(err.message)
      throw new CustomError(500, 'error.removeImageFail', '移除圖檔失敗 (cloudinary)')
    }
  }
}

module.exports = new Cloudinary()
