// 引用 Models
const { Store, User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')

class StoreController {
  deleteStore = asyncError(async (req, res, next) => {
    const { storeId } = req.params

    const store = await Store.findOne({ where: { id: storeId } })
    if (!store) throw new CustomError(401, 'error.storeNotFound', '查無門店')

    await Store.destroy({ where: { id: storeId } })

    const updatedStores = await Store.findAll({
      where: { userId: store.userId },
      attributes: ['id', 'userId', 'cvsStoreId', 'logisticsSubType', 'cvsStoreName', 'cvsAddress', 'cvsTelephone', 'isDefault']
    })

    res.status(200).json({ message: '刪除門市成功', stores: updatedStores })
  })

  putStoreDefault = asyncError(async (req, res, next) => {
    const { storeId } = req.params

    const store = await Store.findOne({ where: { id: storeId } })
    if (!store) throw new CustomError(401, 'error.storeNotFound', '查無門店')

    await Store.update({ isDefault: false }, { where: { userId: store.userId, isDefault: true } })
    await Store.update({ isDefault: true }, { where: { id: storeId } })

    const updatedStores = await Store.findAll({
      where: { userId: store.userId },
      attributes: ['id', 'userId', 'cvsStoreId', 'logisticsSubType', 'cvsStoreName', 'cvsAddress', 'cvsTelephone', 'isDefault']
    })

    res.status(200).json({ message: '更新預設門市成功', stores: updatedStores })
  })
}

module.exports = new StoreController()
