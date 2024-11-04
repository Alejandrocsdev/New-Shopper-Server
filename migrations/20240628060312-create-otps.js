'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      otp: {
        allowNull: false,
        type: Sequelize.STRING
      },
      expire_time: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      attempts: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('otps')
  }
}
