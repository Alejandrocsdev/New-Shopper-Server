'use strict'

/** @type {import('sequelize-cli').Migration} */

const roles = ['buyer', 'seller', 'admin', 'editor', 'viewer']
const rolesData = roles.map((role) => ({ name: role }))

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', rolesData)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null)
  }
}
