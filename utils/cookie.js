const { NODE_ENV, COOKIE_DOMAIN, COOKIE_CUSTOM_DOMAIN } = process.env

const isProduction = NODE_ENV === 'production'

const config = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  path: '/',
  sameSite: isProduction ? 'none' : 'strict',
  secure: isProduction,
  domain: isProduction ? COOKIE_CUSTOM_DOMAIN || COOKIE_DOMAIN : 'localhost'
}

// Passing "options.maxAge" is deprecated.
// In v5.0.0 of Express, this option will be ignored,
// as res.clearCookie will automatically set cookies to expire immediately.
const clearConfig = { ...config }
delete clearConfig.maxAge

class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, config)
  }

  clear(res) {
    return res.clearCookie('jwt', clearConfig)
  }
}

module.exports = new Cookie()
