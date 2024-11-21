'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_words', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_term: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      invoice_header: {
        allowNull: false,
        type: Sequelize.STRING
      },
      invoice_year: {
        allowNull: false,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('invoice_words')
  }
}
