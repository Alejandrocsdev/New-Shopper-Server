// 引用 Models
// const {  } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 綠界科技參數
const ecPay = require('../ecPay')

class EcpayController {
  payment = asyncError(async (req, res, next) => {
    const { orderId, TotalAmount, ItemName } = req.query

    const ecPayParams = ecPay(orderId, { TotalAmount, ItemName })

    res.status(200).json({ message: '前往綠界支付成功', ecPayParams })
  })

  paymentResult = asyncError(async (req, res, next) => {
    console.log(req.body)

    res.status(200).json({ message: '成功收到支付結果', result: req.body })
  })
}

module.exports = new EcpayController()
