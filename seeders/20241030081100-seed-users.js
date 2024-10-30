'use strict'

/** @type {import('sequelize-cli').Migration} */

const { encrypt } = require('../utils')

const usernames = ['test_buyer', 'test_seller', 'test_editor', 'test_viewer']
const password = 'Test1234'

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await encrypt.hash(password)
    const usersData = usernames.map((username) => ({
      username,
      password: hashedPassword
    }))

    const envUserPassword = await encrypt.hash(process.env.OWNER_PASSWORD)
    usersData.push({
      username: process.env.OWNER_USERNAME,
      password: envUserPassword
    })

    await queryInterface.bulkInsert('users', usersData)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null)
  }
}
