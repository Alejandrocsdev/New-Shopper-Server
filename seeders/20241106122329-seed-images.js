'use strict'

/** @type {import('sequelize-cli').Migration} */

const fs = require('fs')

module.exports = {
  async up(queryInterface, Sequelize) {
    // 出處:
    // https://fakestoreapi.com
    // https://www.sanjing3c.com.tw
    // https://www.pcone.com.tw
    const imagesData = require('./images.json')

    const data = imagesData.map((imageData, index) => ({
      link: imageData.image,
      delete_data: 'fake_product',
      entity_id: index + 1,
      entity_type: 'product'
    }))

    await queryInterface.bulkInsert('images', data)
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', null)
  }
}
