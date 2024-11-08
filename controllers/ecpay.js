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
// 引用 axios
const axios = require('axios')
const encrypt = require('../utils/encrypt')

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

  getInvoiceType = asyncError(async (req, res, next) => {
    const InvoiceYear = '113'
    const payload = ecpay.getGovInvoiceWordSetting(InvoiceYear)

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/GetGovInvoiceWordSetting`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '取得財政部配號結果成功', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (getGovInvoiceWordSetting)', error: error.message })
    }
  })

  addInvoiceType = asyncError(async (req, res, next) => {
    const payload = ecpay.AddInvoiceWordSetting()

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/AddInvoiceWordSetting`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '字軌與配號設定', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (addInvoiceWordSetting)', error: error.message })
    }
  })

  setInvoiceType = asyncError(async (req, res, next) => {
    const trackID = '4717'
    const payload = ecpay.SetInvoiceWordSetting(trackID)

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/UpdateInvoiceWordStatus`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '設定字軌號碼狀態成功', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (setInvoiceWordSetting)', error: error.message })
    }
  })

  getInvoice = asyncError(async (req, res, next) => {
    const InvoiceYear = '113'
    const payload = ecpay.getInvoiceWordSetting(InvoiceYear)

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/GetInvoiceWordSetting`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '查詢字軌成功', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (getInvoiceWordSetting)', error: error.message })
    }
  })

  issueInvoice = asyncError(async (req, res, next) => {
    const orderId ='123'
    const payload = ecpay.IssueInvoice(orderId)

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/Issue`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '成立發票成功', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (iIssue)', error: error.message })
    }
  })

  invoicePrint = asyncError(async (req, res, next) => {
    const payload = ecpay.InvoicePrint()

    try {
      const response = await axios.post(
        `${process.env.ECPAY_ENVOICE_API}/B2CInvoice/InvoicePrint`,
        payload
      )

      const data = encrypt.decodeAes(response.data.Data, process.env.ECPAY_ENVOICE_HASH_KEY, process.env.ECPAY_ENVOICE_HASH_IV)
      const parsedData = JSON.parse(data)

      res.status(200).json({ message: '成立發票成功', data: parsedData })
    } catch (error) {
      console.error('ECPay API Error:', error.message)
      res
        .status(500)
        .json({ message: 'ECPay API Error (iIssue)', error: error.message })
    }
  })
}

module.exports = new EcpayController()
