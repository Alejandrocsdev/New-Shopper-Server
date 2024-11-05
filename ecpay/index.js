const time = require('../utils/time')
const encrypt = require('../utils/encrypt')
const { backPublicUrl, frontUrl } = require('../utils')

class Ecpay {
  merchantId(type) {
    return type === 'payment'
      ? process.env.ECPAY_PAYMENT_MERCHANT_ID
      : process.env.ECPAY_LOGISTICS_MERCHANT_ID
  }

  hashKey(type) {
    return type === 'payment'
      ? process.env.ECPAY_PAYMENT_HASH_KEY
      : process.env.ECPAY_LOGISTICS_HASH_KEY
  }

  hashIV(type) {
    return type === 'payment'
      ? process.env.ECPAY_PAYMENT_HASH_IV
      : process.env.ECPAY_LOGISTICS_HASH_IV
  }

  // Payment method
  payment(orderId, payload) {
    const { TotalAmount, ItemName } = payload

    const params = {
      MerchantTradeNo: encrypt.tradeNo(orderId),
      MerchantTradeDate: time.tradeDate(),
      TotalAmount,
      ItemName,
      TradeDesc: '商品訂單',
      ReturnURL: `${global.ngrokUrl || backPublicUrl}/api/ecpay/payment/result`,
      ClientBackURL: `${frontUrl}`,
      PlatformID: '',
      MerchantID: this.merchantId('payment'),
      InvoiceMark: 'N',
      EncryptType: '1',
      PaymentType: 'aio',
      ChoosePayment: 'ALL',
      IgnorePayment: '',
      DeviceSource: ''
    }

    return this.macValue(params, 'payment')
  }

  storeList(CvsType) {
    const params = {
      MerchantID: this.merchantId('logistics'),
      CvsType,
      PlatformID: ''
    }

    return this.macValue(params, 'logistics')
  }

  expressMap(userId, LogisticsSubType, lang) {
    const params = {
      MerchantID: this.merchantId('logistics'),
      MerchantTradeNo: encrypt.tradeNo(`${userId}-`),
      LogisticsType: 'CVS',
      LogisticsSubType,
      IsCollection: 'N',
      ServerReplyURL: `${global.ngrokUrl || backPublicUrl}/api/ecpay/store/express-map/result`,
      ExtraData: lang
    }

    return this.macValue(params, 'logistics')
  }

  macValue(params, type) {
    const paramsArr = Object.entries(params)
    // 將傳遞參數依照第一個英文字母，由A到Z的順序來排序(遇到第一個英文字母相同時，以第二個英文字母來比較，以此類推)
    const sortedParams = paramsArr.sort((a, b) => a[0].localeCompare(b[0]))
    // 以&方式將所有參數串連
    const queryString = sortedParams.map(([key, value]) => `${key}=${value}`).join('&')
    // 參數最前面加上HashKey、最後面加上HashIV
    const addHash = `HashKey=${this.hashKey(type)}&${queryString}&HashIV=${this.hashIV(type)}`
    // 將整串字串進行URL encode
    const encodeURI = encodeURIComponent(addHash)
    // .NET URLEncode
    const encodeNET = encrypt.NETUrlEncode(encodeURI)
    // 轉為小寫
    const toLowerCase = encodeNET.toLowerCase()
    // 以 SHA256 / MD5 加密方式來產生雜凑值
    const hash = type === 'payment' ? encrypt.sha256(toLowerCase) : encrypt.md5(toLowerCase)
    // 再轉大寫產生CheckMacValue
    const toUpperCase = hash.toUpperCase()
    params.CheckMacValue = toUpperCase
    return params
  }
}

module.exports = new Ecpay()
