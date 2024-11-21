'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      logistics_sub_type: {
        allowNull: false,
        type: Sequelize.ENUM('FAMIC2C', 'UNIMARTC2C', 'OKMARTC2C')
      },
      cvs_store_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cvs_store_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cvs_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cvs_telephone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      is_default: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('stores')
  }
}
