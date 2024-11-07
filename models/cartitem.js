'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cart_id',
        as: 'cart'
      })
      CartItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      })
    }
  }
  CartItem.init(
    {
      cartId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      productId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      unitPrice: {
        allowNull: false,
        type: DataTypes.DECIMAL
      },
      totalPrice: {
        allowNull: false,
        type: DataTypes.DECIMAL
      }
    },
    {
      sequelize,
      modelName: 'CartItem',
      tableName: 'cart_items',
      underscored: true
    }
  )
  return CartItem
}
