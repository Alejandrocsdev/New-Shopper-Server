'use strict'

/** @type {import('sequelize-cli').Migration} */

const fs = require('fs')

module.exports = {
  async up(queryInterface, Sequelize) {
    // 出處: 
    // https://fakestoreapi.com
    // https://www.sanjing3c.com.tw
    // https://www.pcone.com.tw
    const productsData = require('./products.json')

    const data = productsData.map((product) => ({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image
    }))

    await queryInterface.bulkInsert('products', data)
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null)
  }
}
