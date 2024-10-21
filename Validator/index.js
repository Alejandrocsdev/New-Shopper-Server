// 引用自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')

class Validator {
  constructor(schema) {
    this.schema = schema
  }

  // 驗證請求主體
  validateBody(payload, route) {
    // 驗證錯誤
    const { error } = this.schema(route).validate(payload)
    if (error) {
      console.log(error.message)
      throw new CustomError(400, 'error.invalidPayload', error.details[0].message)
    }
  }
}

module.exports = Validator
