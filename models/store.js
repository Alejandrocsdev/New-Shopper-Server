'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  }
  Store.init(
    {
      userId: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      logisticsSubType: {
        allowNull: false,
        type: DataTypes.ENUM('FAMIC2C', 'UNIMARTC2C', 'OKMARTC2C')
      },
      cvsStoreId: {
        allowNull: false,
        type: DataTypes.STRING
      },
      cvsStoreName: {
        allowNull: false,
        type: DataTypes.STRING
      },
      cvsAddress: {
        allowNull: false,
        type: DataTypes.STRING
      },
      cvsTelephone: {
        allowNull: false,
        type: DataTypes.STRING
      },
      isDefault: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'Store',
      tableName: 'stores',
      underscored: true
    }
  )
  return Store
}
