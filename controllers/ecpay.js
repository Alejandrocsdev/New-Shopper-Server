// 引用 Models
const { Store } = require('../models')
const { InvoiceWord } = require('../models/admin')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 引用 網址 模組
const { encrypt, frontUrl, urlToImage } = require('../utils')
// 綠界科技參數
const ecpay = require('../ecpay')

class EcpayController {
  paymentParams = asyncError(async (req, res, next) => {
    const { orderId, TotalAmount, ItemName } = req.body

    if (orderId.length > 7) {
      throw new CustomError(400, 'error.orderIdTooLong', 'orderId 不可大於7位數')
    }

    const ecPayParams = ecpay.AioCheckOutCredit(orderId, { TotalAmount, ItemName })

    res.status(200).json({ message: '生成(綠界支付)參數成功', ecPayParams })
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

  getPaymentOrder = asyncError(async (req, res, next) => {
    const { MerchantTradeNo } = req.body

    const data = await ecpay.QueryTradeInfo(MerchantTradeNo)

    let result

    if (data) {
      const params = new URLSearchParams(data)
      result = Object.fromEntries(params.entries())
    }

    res.status(200).json({ message: '查詢訂單成功', result })
  })

  // getStoreListParams = asyncError(async (req, res, next) => {
  //   const { CvsType } = req.query

  //   const ecPayParams = ecpay.GetStoreList(CvsType)

  //   res.status(200).json({ message: '生成(綠界門市清單)參數成功', ecPayParams })
  // })

  getStoreParams = asyncError(async (req, res, next) => {
    const { userId, LogisticsSubType, path } = req.body

    const ecPayParams = ecpay.ExpressMap(userId, LogisticsSubType, path)

    res.status(200).json({ message: '生成(綠界電子地圖)參數成功', ecPayParams })
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

    const path = ExtraData
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
      console.log(`ID:${extractedUserId}用戶 已選取 ID:${CVSStoreID}門市 `)
    } else {
      console.log(`ID:${extractedUserId}用戶 選取新門市`)
    }

    // s=t (success=true)
    return res.status(200).redirect(`${frontUrl}${path}?s=t`)
  })

  getGovWordSetting = asyncError(async (req, res, next) => {
    const { InvoiceYear } = req.body

    const data = { InvoiceYear }

    const result = await ecpay.GetGovInvoiceWordSetting(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    if (RtnCode === 1) {
      const InvoiceInfo = result.InvoiceInfo

      const set = new Set()

      const uniqueInvoiceInfo = InvoiceInfo.filter((item) => {
        if (item.InvType === '07') {
          const uniqueKey = `${item.InvoiceTerm}-${item.InvoiceHeader}`
          if (set.has(uniqueKey)) {
            return false
          } else {
            set.add(uniqueKey)
            return true
          }
        }
      })

      // await InvoiceWord.destroy({ where: {}, truncate: true })

      const existingRecord = await InvoiceWord.findOne({ where: { invoiceYear: InvoiceYear } })

      if (!existingRecord) {
        console.log('財政部配號結果儲存成功')
        await Promise.all(
          uniqueInvoiceInfo.map(async (data) => {
            return InvoiceWord.create({
              invoiceTerm: data.InvoiceTerm,
              invoiceHeader: data.InvoiceHeader,
              invoiceYear: InvoiceYear
            })
          })
        )
      }
    }

    res.status(200).json({ message: RtnCode === 1 ? '取得財政部配號結果成功' : RtnMsg, result })
  })

  addWordSetting = asyncError(async (req, res, next) => {
    const { InvoiceTerm, InvoiceYear, InvoiceHeader, InvoiceStart, InvoiceEnd } = req.body

    const data = {
      InvoiceTerm,
      InvoiceYear,
      InvType: '07',
      InvoiceCategory: '1',
      InvoiceHeader,
      InvoiceStart,
      InvoiceEnd
    }

    const result = await ecpay.AddInvoiceWordSetting(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    res.status(200).json({ message: RtnCode === 1 ? '字軌與配號設定成功' : RtnMsg, result })
  })

  setWordStatus = asyncError(async (req, res, next) => {
    const { TrackID, InvoiceStatus } = req.body

    const data = { TrackID, InvoiceStatus }

    const result = await ecpay.UpdateInvoiceWordStatus(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    res.status(200).json({ message: RtnCode === 1 ? '設定字軌號碼狀態成功' : RtnMsg, result })
  })

  getWordSetting = asyncError(async (req, res, next) => {
    const { InvoiceYear, InvoiceTerm, UseStatus, InvoiceHeader } = req.body

    const data = {
      InvoiceYear,
      InvoiceTerm,
      UseStatus,
      InvoiceCategory: '1',
      InvType: '07',
      InvoiceHeader
    }

    const result = await ecpay.GetInvoiceWordSetting(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    res.status(200).json({ message: RtnCode === 1 ? '查詢字軌成功' : RtnMsg, result })
  })

  issueInvoice = asyncError(async (req, res, next) => {
    const {
      orderId,
      CustomerName,
      CustomerAddr,
      CustomerPhone,
      CustomerEmail,
      SalesAmount,
      Items
    } = req.body

    const RelateNumber = encrypt.tradeNo(orderId)

    const data = {
      // RelateNumber: encrypt.tradeNo(orderId),
      RelateNumber,
      CustomerName,
      CustomerAddr,
      CustomerPhone,
      CustomerEmail,
      Print: '1',
      Donation: '0',
      TaxType: '1',
      SalesAmount,
      Items,
      InvType: '07'
    }

    const result = await ecpay.IssueInvoice(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    res.status(200).json({ message: RtnCode === 1 ? '成立發票成功' : RtnMsg, result })
  })

  printInvoice = asyncError(async (req, res, next) => {
    const { InvoiceNo, InvoiceDate } = req.body

    const data = {
      InvoiceNo,
      InvoiceDate: InvoiceDate.split('+')[0],
      PrintStyle: '1',
      IsShowingDetail: '1'
    }

    const result = await ecpay.InvoicePrint(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg
    const InvoiceHtml = result?.InvoiceHtml

    if (InvoiceHtml) {
      urlToImage(InvoiceHtml, InvoiceNo)
    }

    res.status(200).json({ message: RtnCode === 1 ? '發票列印成功' : RtnMsg, result })
  })

  getIssue = asyncError(async (req, res, next) => {
    const { RelateNumber } = req.body

    const data = {
      RelateNumber
    }

    const result = await ecpay.GetIssue(data)

    const RtnCode = result.RtnCode
    const RtnMsg = result.RtnMsg

    res.status(200).json({ message: RtnCode === 1 ? '查詢發票明細' : RtnMsg, result })
  })
}

module.exports = new EcpayController()
