// 引入加密相關模組
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sha256 = require('./sha256')

// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

class Encrypt {
  // 雜湊
  async hash(data) {
    try {
      const salt = await bcrypt.genSaltSync(10)
      const hashedData = await bcrypt.hash(data, salt)
      return hashedData
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'encrypt.defaultError', '雜湊失敗 (Encrypt)')
    }
  }

  // 雜湊比對
  async hashCompare(data, hashedData) {
    try {
      const isMatch = await bcrypt.compare(data, hashedData)
      return isMatch
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'encrypt.defaultError', '雜湊比對失敗 (Encrypt)')
    }
  }

  // 密鑰
  secret() {
    try {
      const secret = crypto.randomBytes(32).toString('hex')
      return secret
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'encrypt.defaultError', '密鑰生成失敗 (Encrypt)')
    }
  }

  // 簡訊 OTP
  otp() {
    try {
      const code = crypto.randomInt(100000, 1000000)
      return String(code)
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'encrypt.defaultError', '生成OTP失敗 (Encrypt.otp)')
    }
  }

  // 隨機帳號
  randomCredential(length = 10) {
    try {
      const special = '!@#$%&'
      const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
      const number = '0123456789'

      const charSet = special + upperCase + lowerCase + number

      let result = ''
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charSet.length)
        result += charSet[randomIndex]
      }
      return result
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'error.defaultError', '隨機帳號生成失敗 (Encrypt)')
    }
  }

  // 生成唯一帳號
  async uniqueUsername(model) {
    try {
      // 檢查帳號是否存在函式
      const isExist = async username => {
        const user = await model.findOne({ where: { username } })
        return !!user
      }

      let username
      let isUnique = false

      // 持續生成帳號直到生成唯一的帳號
      while (!isUnique) {
        // 隨機生成帳號
        username = this.randomCredential()
        // 檢查帳號是否存在
        isUnique = !(await isExist(username))
      }

      return username
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'error.defaultError', '生成唯一帳號失敗 (Encrypt)')
    }
  }

  // Email JWT
  signEmailToken(id) {
    try {
      const token = jwt.sign({ id: Number(id) }, process.env.EMAIL_SECRET, { expiresIn: '15m' })
      return token
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'error.defaultError', '生成email憑證失敗 (Encrypt)')
    }
  }

  // Access JWT
  signAccessToken(id, rolesData) {
    const roles = rolesData.map(role => role.name)
    try {
      const token = jwt.sign({ id: Number(id), roles }, process.env.AT_SECRET, { expiresIn: '15m' })
      return token
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'error.defaultError', '生成at憑證失敗 (Encrypt)')
    }
  }

  // Refresh JWT
  signRefreshToken(id) {
    try {
      const token = jwt.sign({ id: Number(id) }, process.env.RT_SECRET, { expiresIn: '7d' })
      return token
    } catch (error) {
      console.error(error)
      throw new CustomError(500, 'error.defaultError', '生成rt憑證失敗 (Encrypt)')
    }
  }

  // 驗證 JWT
  verifyToken(token, type) {
    let secret
    switch (type) {
      case 'at':
        secret = process.env.AT_SECRET
        break
      case 'rt':
        secret = process.env.RT_SECRET
        break
      case 'email':
        secret = process.env.EMAIL_SECRET
        break
    }
    try {
      const decoded = jwt.verify(token, secret, { ignoreExpiration: true })
      return decoded
    } catch (error) {
      throw new CustomError(500, 'error.defaultError', `${error.message} (Encrypt && jsonwebtoken)`)
    }
  }

  sha256(input) {
    if (typeof input === 'string') {
      return sha256(input)
    } else {
      throw new CustomError(500, 'error.defaultError', 'sh256 雜湊失敗')
    }
  }

  md5(input) {
    if (typeof input === 'string') {
      return crypto.createHash('md5').update(input).digest('hex')
    } else {
      throw new CustomError(500, 'error.defaultError', 'md5 雜湊失敗')
    }
  }

  aes(data, hashKey, hashIV) {
    const encodedData = encodeURIComponent(data)

    const cipher = crypto.createCipheriv('aes-128-cbc', hashKey, hashIV)
    cipher.setAutoPadding(true)

    let encrypted = cipher.update(encodedData, 'utf8', 'base64')
    encrypted += cipher.final('base64')

    return encrypted
  }

  decodeAes(encryptedData, hashKey, hashIV) {
    const decipher = crypto.createDecipheriv('aes-128-cbc', hashKey, hashIV)
    decipher.setAutoPadding(true)

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decodeURIComponent(decrypted)
  }

  tradeNo(orderId) {
    const timestamp = Date.now()
    const tradeNo = `${orderId}${timestamp}`
    if (tradeNo.length <= 20) {
      return tradeNo
    } else {
      throw new CustomError(500, 'error.defaultError', '交易號碼不可大於20位數')
    }
  }

  NETUrlEncode(str) {
    if (typeof str === 'string') {
      const customEncode = str.replace(/~/g, '%7E').replace(/%20/g, '+').replace(/'/g, '%27')
      return customEncode
    } else {
      throw new CustomError(500, 'error.defaultError', 'URL (.NET) 加密失敗')
    }
  }
}

module.exports = new Encrypt()
