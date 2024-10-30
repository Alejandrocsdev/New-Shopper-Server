'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Image, {
        foreignKey: 'entityId',
        scope: { entityType: 'user' },
        as: 'avatar'
      })
      User.belongsToMany(models.Role, {
        through: 'user_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
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
          }
        ]
      }
    }
  )
  return User
}
