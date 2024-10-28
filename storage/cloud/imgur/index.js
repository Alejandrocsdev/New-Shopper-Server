// 引用 axios
const axios = require('axios')
// 引用客製化錯誤訊息模組
const CustomError = require('../../../errors/CustomError')
// imgur設定
const baseUrl = process.env.IMGUR_BASE_URL
const accessToken = process.env.IMGUR_ACCESS_TOKEN

class Imgur {
  async upload(file) {
    // 檔案不存在停止執行
    if (!file) return null

    try {
      const image = file.buffer.toString('base64')
      const response = await axios.post(
        `${baseUrl}/image`,
        { image },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = response.data.data
      let link = data.link
      const deleteData = data.deletehash

      // imgur只接受.jpg (但常常預設是.jpeg)
      if (link.endsWith('.jpeg')) link = link.slice(0, -5) + '.jpg'

      return { link, deleteData }
    } catch (err) {
      console.log(err.message)
      throw new CustomError(500, 'error.uploadImageFail', '本地圖檔上傳失敗 (imgur)')
    }
  }

  async delete(deletehash) {
    // 來自臉書或Gmail照片無須刪除(從未儲存)
    if (deletehash === 'fb' || deletehash === 'gm') return
    try {
      await axios.delete(`${baseUrl}/image/${deletehash}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    } catch (err) {
      console.log(err.message)
      throw new CustomError(500, 'error.removeImageFail', '移除圖檔失敗 (imgur)')
    }
  }
}

module.exports = new Imgur()
