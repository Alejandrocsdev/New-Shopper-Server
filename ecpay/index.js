const time = require('../utils/time')
const encrypt = require('../utils/encrypt')
const { backUrl, frontUrl } = require('../utils')

function ecPay(orderId, payload) {
  const { TotalAmount, ItemName } = payload
console.log(`${global.ngrokUrl || backUrl}/api/ecpay/payment/result`)
  const params = {
    MerchantTradeNo: encrypt.tradeNo(orderId),
    MerchantTradeDate: time.tradeDate(),
    TotalAmount,
    ItemName,
    TradeDesc: '商品訂單',
    ReturnURL: `${global.ngrokUrl || backUrl}/api/ecpay/payment/result`,
    ClientBackURL: `${frontUrl}`,
    PlatformID: '',
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    InvoiceMark: 'N',
    EncryptType: '1',
    PaymentType: 'aio',
    ChoosePayment: 'ALL',
    IgnorePayment: '',
    DeviceSource: ''
  }

  return macValue(params)
}

function macValue(params) {
  const paramsArr = Object.entries(params)
  const sortedParams = paramsArr.sort((a, b) => a[0].localeCompare(b[0]))
  const queryString = sortedParams.map(([key, value]) => `${key}=${value}`).join('&')
  const addHash = `HashKey=${process.env.ECPAY_HASH_KEY}&${queryString}&HashIV=${process.env.ECPAY_HASH_IV}`
  const encodeURI = encodeURIComponent(addHash)
  const encodeNET = encrypt.NETUrlEncode(encodeURI)
  const toLowerCase = encodeNET.toLowerCase()
  const sha256 = encrypt.sha256(toLowerCase)
  const toUpperCase = sha256.toUpperCase()
  params.CheckMacValue = toUpperCase
  return params
}

module.exports = ecPay
