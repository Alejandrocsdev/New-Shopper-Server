'use strict'

const { encrypt } = require('../utils')

const usernames = [
  'test_admin',
  'test_buyer',
  'test_seller',
  'test_editor',
  'test_viewer',
  'seller_01',
  'seller_02',
  'seller_03'
]
const password = 'Test1234'

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await encrypt.hash(password)
    const usersData = usernames.map(username => ({
      username,
      username_modified: false,
      password: hashedPassword
    }))

    const envUserPassword = await encrypt.hash(process.env.OWNER_PASSWORD)
    usersData.push({
      username: process.env.OWNER_USERNAME,
      username_modified: true,
      password: envUserPassword
    })

    await queryInterface.bulkInsert('users', usersData)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null)
  }
}
