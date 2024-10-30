'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: 'user_roles',
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'users'
      })
    }
  }
  Role.init(
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      underscored: true
    }
  )
  return Role
}
