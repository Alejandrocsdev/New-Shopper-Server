'use strict'

const roles = ['buyer', 'seller', 'admin', 'editor', 'viewer']
const rolesData = roles.map(role => ({ name: role }))

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', rolesData)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null)
  }
}
