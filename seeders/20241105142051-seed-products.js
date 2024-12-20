'use strict'

module.exports = {
  async up(queryInterface) {
    // 出處:
    // https://fakestoreapi.com
    // https://www.sanjing3c.com.tw
    // https://www.pcone.com.tw
    const productsData = require('./products.json')

    const userIds = [2, 5, 6]

    const data = productsData.map((product, index) => ({
      name: product.name,
      user_id: userIds[index % userIds.length],
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock
    }))

    await queryInterface.bulkInsert('products', data)
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null)
  }
}
