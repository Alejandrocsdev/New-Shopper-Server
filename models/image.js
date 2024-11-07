'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.User, {
        foreignKey: 'entityId',
        scope: { entityType: 'user' }
      })
      Image.belongsTo(models.Product, {
        foreignKey: 'entityId',
        scope: { entityType: 'product' }
      })
    }
  }
  Image.init(
    {
      link: {
        allowNull: true,
        type: DataTypes.STRING
      },
      deleteData: {
        allowNull: true,
        type: DataTypes.STRING
      },
      entityId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      entityType: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'images',
      underscored: true
    }
  )
  return Image
}
