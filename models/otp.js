'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    // static associate(models) {}
  }
  Otp.init(
    {
      phone: {
        allowNull: true,
        type: DataTypes.STRING
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING
      },
      otp: {
        allowNull: false,
        type: DataTypes.STRING
      },
      expireTime: {
        allowNull: false,
        type: DataTypes.BIGINT
      },
      attempts: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'Otp',
      tableName: 'otps',
      underscored: true
    }
  )
  return Otp
}
