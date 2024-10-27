const { Router } = require('express')
const router = Router()

const { authController } = require('../controllers')

const { checkId, jwtAuth } = require('../middlewares')

const {
  pwdSignInAuth,
  smsSignInAuth,
  facebookSignInAuth,
  gmailSignInAuth
} = require('../config/passport')

// 驗證參數 userId
router.param('userId', checkId)

router.get('/sign-in/facebook', facebookSignInAuth)
router.get('/sign-in/facebook/callback', facebookSignInAuth, authController.thirdPartySign)
router.get('/sign-in/gmail', gmailSignInAuth)
router.get('/sign-in/gmail/callback', gmailSignInAuth, authController.thirdPartySign)
router.post('/refresh', authController.refresh)
router.post('/sign-in/auto/:userId', authController.autoSignIn)
router.post('/sign-in/pwd', pwdSignInAuth, authController.signIn)
router.post('/sign-in/sms', smsSignInAuth, authController.signIn)
router.post('/sign-up', authController.signUp)
router.post('/sign-out', authController.signOut)
router.get('/me', jwtAuth, authController.getAuthUser)

module.exports = router
