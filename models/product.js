'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {}
  }
  Product.init(
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      category: {
        allowNull: false,
        type: DataTypes.STRING
      },
      price: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      stock: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      image: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      underscored: true
    }
  )
  return Product
}
