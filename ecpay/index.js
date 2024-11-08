const time = require('../utils/time')
const { encrypt } = require('../utils')
const { backPublicUrl, frontUrl } = require('../utils')

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

    console.log('ServerReplyURL', params.ServerReplyURL)

    return this.macValue(params, 'logistics')
  }

  getGovInvoiceWordSetting(InvoiceYear) {
    const MerchantID = this.merchantId('envoice')

    const requestData = JSON.stringify({
      MerchantID,
      InvoiceYear
    })

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
  }

  AddInvoiceWordSetting() {
    const MerchantID = this.merchantId('envoice')

    const requestData = JSON.stringify({
      MerchantID,
      InvoiceTerm: '6',
      InvoiceYear: '113',
      InvType: '07',
      InvoiceCategory: '1',
      InvoiceHeader: 'TZ',
      InvoiceStart: '90005050',
      InvoiceEnd: '90005099'
    })

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
  }

  SetInvoiceWordSetting(TrackID) {
    const MerchantID = this.merchantId('envoice')

    const requestData = JSON.stringify({
      MerchantID,
      TrackID,
      InvoiceStatus: '2'
    })

    // 0:停用
    // 1:暫停
    // 2:啟用

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
  }

  getInvoiceWordSetting(InvoiceYear) {
    const MerchantID = this.merchantId('envoice')

    const requestData = JSON.stringify({
      MerchantID,
      InvoiceYear,
      InvoiceTerm: '0',
      UseStatus: '2',
      InvoiceCategory: '1',
      InvType: '07'
    })

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
  }

  IssueInvoice(orderId) {
    const MerchantID = this.merchantId('envoice')

    const requestData = JSON.stringify({
      MerchantID,
      RelateNumber: encrypt.tradeNo(orderId),
      CustomerName: 'John Doe',
      CustomerAddr: '123 Sample Street',
      CustomerPhone: '0912345678',
      CustomerEmail: 'johndoe@example.com',
      Print: '1',
      Donation: '0',
      TaxType: '1',
      SalesAmount: 10000,
      Items: [
        {
          ItemName: 'Sample Item',
          ItemCount: '2',
          ItemWord: 'pcs',
          ItemPrice: '5000',
          ItemAmount: '10000'
        }
      ],
      InvType: '07'
    })

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
  }

  InvoicePrint(orderId) {
    const MerchantID = this.merchantId('envoice')
    // "RtnCode": 1,
    // "RtnMsg": "開立發票成功",
    // "InvoiceNo": "TZ90005056",
    // "InvoiceDate": "2024-11-08+19:41:14",
    // "RandomNumber": "9931"
    const requestData = JSON.stringify({
      MerchantID,
      InvoiceNo: 'TZ90002529',
      InvoiceDate: '2024-11-08',
      PrintStyle: '1',
      IsShowingDetail: '0'
    })

    const encryptedData = encrypt.aes(requestData, this.hashKey('envoice'), this.hashIV('envoice'))

    const payload = {
      MerchantID,
      RqHeader: {
        Timestamp: Math.floor(Date.now() / 1000)
      },
      Data: encryptedData
    }

    return payload
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
