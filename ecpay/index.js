// 引用 工具 模組
const { time, encrypt, backPublicUrl, frontUrl } = require('../utils')
// 引用 axios
const axios = require('axios')

class Ecpay {
  merchantId(type) {
    return process.env[`ECPAY_${type.toUpperCase()}_MERCHANT_ID`]
  }

  hashKey(type) {
    return process.env[`ECPAY_${type.toUpperCase()}_HASH_KEY`]
  }

  hashIV(type) {
    return process.env[`ECPAY_${type.toUpperCase()}_HASH_IV`]
  }

  api(type) {
    return process.env[`ECPAY_${type.toUpperCase()}_API`]
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

  securePayload(data) {
    const MerchantID = this.merchantId('einvoice')

    data.MerchantID = MerchantID

    const requestData = JSON.stringify(data)

    const encryptedData = encrypt.aes(requestData, this.hashKey('einvoice'), this.hashIV('einvoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: time.unixTimeStamp()
      },
      Data: encryptedData
    }

    return payload
  }

  async einvoiceResult(data, api) {
    const payload = this.securePayload(data)
    try {
      const response = await axios.post(api, payload)

      const Data = response.data.Data

      const decodedData = encrypt.decodeAes(Data, this.hashKey('einvoice'), this.hashIV('einvoice'))

      return JSON.parse(decodedData)
    } catch (error) {
      console.log(error.message)
    }
  }

  AioCheckOutCredit(orderId, payload) {
    const { TotalAmount, ItemName } = payload

    const MerchantTradeNo = encrypt.tradeNo(orderId)
    console.log('MerchantTradeNo', MerchantTradeNo)

    const params = {
      MerchantID: this.merchantId('payment'),
      // MerchantTradeNo: encrypt.tradeNo(orderId),
      MerchantTradeNo,
      MerchantTradeDate: time.tradeDate(),
      PaymentType: 'aio',
      TotalAmount,
      TradeDesc: '商品訂單',
      ItemName,
      ReturnURL: `${global.ngrokUrl || backPublicUrl}/api/ecpay/payment/result`,
      ChoosePayment: 'Credit',
      EncryptType: '1',
      ClientBackURL: `${frontUrl}`
    }

    return this.macValue(params, 'payment')
  }

  async QueryTradeInfo(MerchantTradeNo) {
    const params = {
      MerchantID: this.merchantId('payment'),
      MerchantTradeNo,
      TimeStamp: time.unixTimeStamp()
    }

    const ecpayParams = this.macValue(params, 'payment')

    console.log(ecpayParams)

    const api = `${this.api('payment')}/Cashier/QueryTradeInfo/V5`

    console.log(api)

    try {
      const response = await axios.post(api, ecpayParams)
      console.log('data', response.data)
      return response.data
    } catch (error) {
      console.log(error.message)
    }
  }

  // GetStoreList(CvsType) {
  //   const params = {
  //     MerchantID: this.merchantId('logistics'),
  //     CvsType
  //   }

  //   return this.macValue(params, 'logistics')
  // }

  ExpressMap(userId, LogisticsSubType, path) {
    const params = {
      MerchantID: this.merchantId('logistics'),
      MerchantTradeNo: encrypt.tradeNo(`${userId}-`),
      LogisticsType: 'CVS',
      LogisticsSubType,
      IsCollection: 'N',
      ServerReplyURL: `${global.ngrokUrl || backPublicUrl}/api/ecpay/logisticts/store/result`,
      ExtraData: path
    }

    return this.macValue(params, 'logistics')
  }

  GetGovInvoiceWordSetting(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/GetGovInvoiceWordSetting`

    return this.einvoiceResult(data, api)
  }

  AddInvoiceWordSetting(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/AddInvoiceWordSetting`

    return this.einvoiceResult(data, api)
  }

  UpdateInvoiceWordStatus(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/UpdateInvoiceWordStatus`

    return this.einvoiceResult(data, api)
  }

  GetInvoiceWordSetting(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/GetInvoiceWordSetting`

    return this.einvoiceResult(data, api)
  }

  IssueInvoice(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/Issue`

    return this.einvoiceResult(data, api)
  }

  InvoicePrint(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/InvoicePrint`

    return this.einvoiceResult(data, api)
  }

  GetIssue(data) {
    const api = `${this.api('einvoice')}/B2CInvoice/GetIssue`

    return this.einvoiceResult(data, api)
  }
}

module.exports = new Ecpay()
