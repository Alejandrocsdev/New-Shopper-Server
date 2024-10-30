'use strict'

/** @type {import('sequelize-cli').Migration} */

const roles = ['buyer', 'seller', 'admin', 'editor', 'viewer']
const roleData = roles.map((role) => ({ name: role }))

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', roleData)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null)
  }
}
