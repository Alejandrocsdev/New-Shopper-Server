// 引用環境變數模組
require('dotenv').config()
// 引用後端框架
const express = require('express')
// 引用 ngrok
const ngrok = require('ngrok')
// 建立 Express 應用程式
const app = express()
// 伺服器端口
const port = process.env.PORT
// 引用 node.js 內建模組 path
const path = require('path')
// 引用 CORS 中間件
const cors = require('cors')
// 引用前端網域
const { frontUrl } = require('./utils')
// 允許來源
const allowedOrigins = [
  frontUrl,
  process.env.ECPAY_PAYMENT_API,
  process.env.ECPAY_LOGISTICS_API,
  process.env.ECPAY_EINVOICE_API
]
// 設定 CORS 的選項，允許來自特定來源的請求，並且允許攜帶憑證
const corsOptions = {
  origin: (origin, callback) => {
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
// 處理瀏覽器自動請求的 favicon.ico，回應 204 狀態碼 (無內容)
app.get('/favicon.ico', (req, res) => res.status(204))
// Express 中間件: 解析請求主體的 JSON 格式資料
app.use(express.json())
// Express 中間件: 解析請求主體的 URL 編碼格式資料 (使用擴展模式)
app.use(express.urlencoded({ extended: true }))
// Passport 初始化
app.use(passportInit)
// app.use((req, res, next) => {
//   res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
//   next()
// })
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`, process.env.ECPAY_API]
//     }
//   })
// )
// 解析靜態資源的路徑 (本地存儲照片)
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'local', 'images')))
// 中間件: 跨來源資源共用
app.use(cors(corsOptions))
// 中間件: 解析 Cookie
app.use(cookieParser())
// 掛載路由中間件
app.use('/api', routes)
// Root Route
app.get('/', (req, res) => res.status(200).json({ message: 'Server is up and running.', status: 'ok' }))
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
      console.info(`Ngrok tunnel open at: ${global.ngrokUrl}`)
    } catch (error) {
      console.error('Error starting ngrok:', error)
    }
  }
})
