# 專案功能

<h2 style="color: #007ACC;">綠界 (ECPay)</h2>

綠界的API分為三大領域：

<h3 style="color: #FF5733;">金流 (Payment)：</h3>

信用卡一次付清 AioCheckOut

查詢訂單 QueryTradeInfo

信用卡測試卡號：

卡號: 4311-9511-1111-1111

有效月/年: 大於現在當下時間的月年

安全碼: 任意輸入三碼數字

<h3 style="color: #FF5733;">物流 (Logistics)：</h3>

門市電子地圖 ExpressMap

<h3 style="color: #FF5733;">發票 (Einvoice)：</h3>

查詢財政部配號結果 GetGovInvoiceWordSetting

字軌與配號設定 AddInvoiceWordSetting

設定字軌號碼狀態 UpdateInvoiceWordStatus

查詢字軌 GetInvoiceWordSetting

開立發票 IssueInvoice

發票列印 InvoicePrint

查詢發票明細 GetIssue

<h2 style="color: #007ACC;">電子郵件與短信發送</h2>

<h3 style="color: #FF5733;">Gmail 電子郵件發送</h3>

- 使用 **Nodemailer** SDK 與 Gmail 實現電子郵件發送功能。
- 配置檔案: `./config/email`

<h3 style="color: #FF5733;">TWSMS 短信發送</h3>

- 使用 **TWSMS API** 手動發送短信。
- 優：開發模式中，任何台灣電話可以接收簡訊。
- 劣：除非已驗證為商業用途，否則短信無法在生產模式下發送。(2024/10開始)
- 配置檔案: `./config/phone/twsms`

<h3 style="color: #FF5733;">Twilio 短信發送</h3>

- 使用 **Twilio SDK** 實現短信發送功能。
- 優：生產模式下可發送簡訊。
- 劣：只能發送簡訊至驗證過電話號碼。
- 配置檔案: `./config/phone/twilio`

---

<h2 style="color: #007ACC;">身份驗證</h2>

- 使用 **Passport** 庫實現身份驗證功能。
  - Facebook
  - Google OAuth 2.0 (Gmail)
  - Local (帳號/密碼)
  - Custom (簡訊)
- 配置檔案: `./config/passport`

---

<h2 style="color: #007ACC;">資料庫管理</h2>

- **管理兩個資料庫**：
  - 通過自定義 `.sequelizerc` 文件與模型設置管理多個資料庫。

- **遷移與種子操作**：
  - 使用 **cross-env** 和 **sequelize-cli** 執行遷移與種子操作。
  - 支援 `shopper` 和 `admin` 資料庫在開發與生產模式下的獨立操作。

---

<h2 style="color: #007ACC;">雲端存儲照片</h2>

- **Cloudinary SDK**：
  - 使用 Cloudinary SDK 實現雲端存儲。

- **Imgur API**：
  - 整合 **Imgur API** 實現雲端存儲功能。

---

<h2 style="color: #007ACC;">驗證</h2>

- **自定義驗證器**：
  - 使用 **Joi** 實現自定義驗證器類，用於擴展所有控制器功能。
