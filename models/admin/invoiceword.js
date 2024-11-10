'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class InvoiceWord extends Model {
    static associate(models) {}
  }
  InvoiceWord.init(
    {
      invoiceTerm: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      invoiceHeader: {
        allowNull: false,
        type: DataTypes.STRING
      },
      invoiceYear: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'InvoiceWord',
      tableName: 'invoice_words',
      underscored: true
    }
  )
  return InvoiceWord
}
