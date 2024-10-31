const userController = require('./user')
const authController = require('./auth')
const verifController = require('./verif')
const notifController = require('./notif')
const ecpayController = require('./ecpay')

module.exports = { authController, userController, verifController, notifController, ecpayController }