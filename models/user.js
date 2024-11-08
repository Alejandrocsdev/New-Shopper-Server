'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Image, {
        foreignKey: 'entity_id',
        scope: { entity_type: 'user' },
        as: 'avatar'
      })
      User.belongsToMany(models.Role, {
        through: 'user_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
      })
      User.hasMany(models.Store, {
        foreignKey: 'user_id',
        as: 'stores'
      })
      User.hasMany(models.Product, {
        foreignKey: 'user_id',
        as: 'products'
      })
      User.hasOne(models.Cart, {
        foreignKey: 'user_id',
        as: 'cart'
      })
    }
  }
  User.init(
    {
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      usernameModified: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      facebookId: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true
      },
      gmailId: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        allowNull: true,
        type: DataTypes.STRING
      },
      phone: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true
      },
      refreshToken: {
        allowNull: true,
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      defaultScope: {
        include: [
          {
            model: sequelize.models.Image,
            as: 'avatar',
            attributes: ['link']
          },
          {
            model: sequelize.models.Role,
            as: 'roles',
            attributes: ['name'],
            through: { attributes: [] }
          },
          {
            model: sequelize.models.Store,
            as: 'stores',
            attributes: ['id', 'userId', 'cvsStoreId', 'logisticsSubType', 'cvsStoreName', 'cvsAddress', 'cvsTelephone', 'isDefault']
          },
          {
            model: sequelize.models.Product,
            as: 'products',
            attributes: ['id', 'name', 'description', 'price', 'stock'],
            include: [
              {
                model: sequelize.models.Image,
                as: 'image',
                attributes: ['link']
              }
            ]
          },
          {
            model: sequelize.models.Cart,
            as: 'cart',
            attributes: ['id', 'userId'],
            include: [
              {
                model: sequelize.models.CartItem,
                as: 'items',
                attributes: ['id', 'productId', 'quantity', 'unitPrice', 'totalPrice'],
                include: [
                  {
                    model: sequelize.models.Product,
                    as: 'product',
                    attributes: ['name', 'price', 'stock'],
                    include: [
                      {
                        model: sequelize.models.Image,
                        as: 'image',
                        attributes: ['link']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  )
  return User
}
