'use strict'

/** @type {import('sequelize-cli').Migration} */

const userRolesData = [
  { user_id: 1, role_id: 1 },
  { user_id: 2, role_id: 1 },
  { user_id: 2, role_id: 2 },
  { user_id: 3, role_id: 1 },
  { user_id: 3, role_id: 4 },
  { user_id: 4, role_id: 1 },
  { user_id: 4, role_id: 5 },
  { user_id: 5, role_id: 1 },
  { user_id: 5, role_id: 2 },
  { user_id: 5, role_id: 3 }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_roles', userRolesData)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null)
  }
}
