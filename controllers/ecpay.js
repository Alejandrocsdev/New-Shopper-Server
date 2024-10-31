// 引用 Models
// const {  } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 綠界科技參數
const ecPay = require('../ecpay')

class EcpayController {
  payment = asyncError(async (req, res, next) => {
    const { orderId, TotalAmount, ItemName } = req.query

    const ecPayParams = ecPay(orderId, { TotalAmount, ItemName })

    const formHtml = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5">
          ${Object.entries(ecPayParams).map(
            ([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`
          ).join('')}
        </form>
      </body>
    </html>
  `

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

    // CustomField1: '',
    // CustomField2: '',
    // CustomField3: '',
    // CustomField4: '',
    // MerchantID: '3002607',
    // MerchantTradeNo: '123451730388671047',
    // PaymentDate: '2024/10/31 23:31:22',
    // PaymentType: 'WebATM_LAND',
    // PaymentTypeChargeFee: '3',
    // RtnCode: '1',
    // RtnMsg: '交易成功',
    // SimulatePaid: '0',
    // StoreID: '',
    // TradeAmt: '256',
    // TradeDate: '2024/10/31 23:31:11',
    // TradeNo: '2410312331118067',
    // CheckMacValue: 'B7E0992356DF0E3C8CD60FC8FA2AF523C351F30DE9449CF24EE88C9513412D1D'

    return res.status(200).send('1|OK')
  })
}

module.exports = new EcpayController()
