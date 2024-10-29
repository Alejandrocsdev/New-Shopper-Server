require('dotenv').config()

module.exports = {
  [process.env.NODE_ENV]: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    dialect: 'mysql'
  }
}