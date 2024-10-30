// 引用 node.js 內建模組
const fs = require('fs')
const path = require('path')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')

class Local {
  async upload(file, options) {
    const { entityType, entityId } = options
    // 檔案不存在停止執行
    if (!file) return null

    // 本地存儲位置 (/user/2/XXX.png | /product/5/XXX.jpeg)
    const localIndex = entityType && entityId ? `${entityType}/${entityId}/` : ''
    // 絕對存儲路徑
    const baseDirectory = path.join(__dirname, '..', '..', 'storage', 'local', 'images', localIndex)

    try {
      // 如目標路徑不存在, 預先建立資料夾
      await fs.promises.mkdir(baseDirectory, { recursive: true })
      // 檔案目標路徑位置
      const filePath = path.join(baseDirectory, file.filename)
      // 將上傳的暫存檔案移動到最終儲存路徑
      await fs.promises.rename(file.path, filePath)
      // 資料庫儲存名稱 (不含後端public網域)
      const storedPath = `/uploads/${localIndex}${file.filename}`

      return { link: storedPath, deleteData: `/${localIndex}${file.filename}` }
    } catch (err) {
      console.log(err.message)
      throw new CustomError(500, 'error.uploadImageFail', '本地圖檔上傳失敗 (local)')
    }
  }

  async delete(fileName) {
    const deleteData = fileName
    // 來自臉書或Gmail照片無須刪除(從未儲存)
    if (deleteData === 'fb' || deleteData === 'gm') return
    try {
      const filePath = path.join(__dirname, '..', '..', 'storage', 'local', 'images', fileName)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err.message)
          throw new CustomError(500, 'error.removeTempImageFail', '移除圖檔失敗 (local)')
        }
      })
    } catch (err) {
      console.log(err.message)
      throw new CustomError(500, 'error.removeImageFail', '移除圖檔失敗 (local)')
    }
  }
}

module.exports = new Local()
