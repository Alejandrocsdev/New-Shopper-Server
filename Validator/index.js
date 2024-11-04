// 引用驗證模組
const Joi = require('joi')
// 引用自訂錯誤訊息模組
const CustomError = require('../errors/CustomError')

class Validator {
  constructor(rules) {
    this.schemaParts = {
      username: Joi.string().min(8).max(16),
      password: Joi.string().min(8).max(16).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/),
      phone: Joi.string().regex(/^09/).length(10),
      lang: Joi.string().valid('zh', 'en', 'es').required(),
      otp: Joi.string().length(6).required(),
      email: Joi.string().email(),
      isReset: Joi.boolean().required()
    }

    this.schemas = this.createSchemas(rules)
  }

  createSchemas(rules) {
    const schemas = {}

    // route: 'sendOtp' / ruleKeys: ['phone', 'otp']
    for (const [route, ruleKeys] of Object.entries(rules)) {
      const schemaObject = {}

      ruleKeys.forEach((ruleKey) => {
        // schemaObject.phone = this.schemaParts.phone
        schemaObject[ruleKey] = this.schemaParts[ruleKey]
      })

      // schemas.sendOtp = Joi.object(Joi.string().regex(/^09/).length(10).required())
      schemas[route] = Joi.object(schemaObject)
    }

    return schemas
  }

  // 驗證請求主體
  validateBody(payload, route) {
    const schema = this.schemas[route]
    if (!schema) {
      throw new CustomError(400, 'error.invalidSchema', `查無 ${route} api 的 Joi schema`)
    }

    const { error } = schema.validate(payload)
    if (error) {
      throw new CustomError(400, 'error.invalidPayload', error.details[0].message)
    }
  }
}

module.exports = Validator
