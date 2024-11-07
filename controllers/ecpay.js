// 引用 Models
const { Store } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用 網址 模組
const { frontUrl } = require('../utils')
// 綠界科技參數
const ecpay = require('../ecpay')

class EcpayController {
  payment = asyncError(async (req, res, next) => {
    const { orderId, TotalAmount, ItemName } = req.query

    const ecPayParams = ecpay.payment(orderId, { TotalAmount, ItemName })

    res.status(200).json({ message: '前往綠界支付成功', ecPayParams })
  })

  paymentResult = asyncError(async (req, res, next) => {
    const {
      CustomField1,
      CustomField2,
      CustomField3,
      CustomField4,
      MerchantID,
      MerchantTradeNo,
      PaymentDate,
      PaymentType,
      PaymentTypeChargeFee,
      RtnCode,
      RtnMsg,
      SimulatePaid,
      StoreID,
      TradeAmt,
      TradeDate,
      TradeNo,
      CheckMacValue
    } = req.body

    console.log(req.body)

    return res.status(200).send('1|OK')
  })

  getStoreList = asyncError(async (req, res, next) => {
    const { CvsType } = req.query

    const ecPayParams = ecpay.storeList(CvsType)

    res.status(200).json({ message: '取得綠界門市清單成功', ecPayParams })
  })

  getStore = asyncError(async (req, res, next) => {
    const { userId, LogisticsSubType, lang } = req.query

    const ecPayParams = ecpay.expressMap(userId, LogisticsSubType, lang)

    res.status(200).json({ message: '選取綠界門市成功 (電子地圖)', ecPayParams })
  })

  getStoreResult = asyncError(async (req, res, next) => {
    const {
      MerchantID,
      MerchantTradeNo,
      LogisticsSubType,
      CVSStoreID,
      CVSStoreName,
      CVSAddress,
      CVSTelephone,
      CVSOutSide,
      ExtraData
    } = req.body

    console.log(req.body)

    const lang = ExtraData
    const extractedUserId = MerchantTradeNo.split('-')[0]
    const existingStores = await Store.findAll({ where: { userId: extractedUserId } })
    const isDefault = existingStores.length === 0

    const [store, created] = await Store.findOrCreate({
      where: {
        userId: extractedUserId,
        cvsStoreId: CVSStoreID
      },
      defaults: {
        logisticsSubType: LogisticsSubType,
        cvsStoreName: CVSStoreName,
        cvsAddress: CVSAddress,
        cvsTelephone: CVSTelephone,
        isDefault
      }
    })

    if (!created) {
      console.log(`Store with ID ${CVSStoreID} already exists for user ${extractedUserId}.`)
    } else {
      console.log(`New store created for user ${extractedUserId}.`)
    }

    return res.status(200).redirect(`${frontUrl}/${lang}/profile/address?success=true`)
  })
}

module.exports = new EcpayController()
