// 引用環境變數模組
require('dotenv').config()
// 引用後端框架
const express = require('express')
// 引用 helmet
const helmet = require('helmet')
const crypto = require('crypto')
// 引用 ngrok
const ngrok = require('ngrok')
// 建立 Express 應用程式
const app = express()
app.use((req, res, next) => {
  // Log headers added by Helmet
  console.log('2Response Headers:', res.getHeaders())
  next()
})
// 伺服器端口
const port = process.env.PORT
// 引用 node.js 內建模組
const path = require('path')
// 引用 CORS 中間件
const cors = require('cors')
// 引用前端網域
const { frontUrl } = require('./utils')
// 允許來源
const allowedOrigins = [frontUrl, 'http://localhost:5180']
// 設定 CORS 的選項，允許來自特定來源的請求，並且允許攜帶憑證
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}
// 引用 Cookie-Parser 中間件
const cookieParser = require('cookie-parser')
// 引用 Passport 初始化模組
const { passportInit } = require('./config/passport')
// 引用路由模組
const routes = require('./routes')
// 引用自定義中間件(預設路由/全域錯誤)
const { defaultRoute, globalError } = require('./middlewares')
// Express 中間件: 解析請求主體的 JSON 格式資料
app.use(express.json())
// Express 中間件: 解析請求主體的 URL 編碼格式資料 (使用擴展模式)
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
  next()
})
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: [(req, res) => `'nonce-${res.locals.cspNonce}'`]
    }
  })
)
app.use((req, res, next) => {
  // Log headers added by Helmet
  console.log('2Response Headers:', res.getHeaders())
  next()
})
// 解析靜態資源的路徑 (本地存儲照片)
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'local', 'images')))
// 中間件: 跨來源資源共用
app.use(cors(corsOptions))
// 中間件: 解析 Cookie
app.use(cookieParser())
// 掛載路由中間件
app.use('/api', routes)
// Root Route
app.get('/', (req, res) => res.status(200).json({ message: 'Server is up and running.' }))
// 掛載預設路由中間件
app.all('*', defaultRoute)
// 掛載全域錯誤中間件
app.use(globalError)
// 監聽伺服器運行
app.listen(port, async () => {
  console.info(`Express server running on port: ${port}`)
  if (process.env.NODE_ENV === 'development') {
    try {
      global.ngrokUrl = await ngrok.connect({
        authtoken: process.env.NGROK_AUTH_TOKEN,
        addr: port
      })
      console.info(`ngrok tunnel open at: ${global.ngrokUrl}`)
    } catch (error) {
      console.error('Error starting ngrok:', error)
    }
  }
})
