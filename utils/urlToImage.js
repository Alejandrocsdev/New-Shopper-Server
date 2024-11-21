const puppeteer = require('puppeteer')
const path = require('path')

async function urlToImage(url, fileName) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'networkidle2' })

  const cm = 37.7952755906

  const vw = page.viewport().width
  const x = (vw - 680) / 2
  const y = 0.5 * cm
  const width = 5.7 * cm
  const height = 9 * cm

  // public
  const targetPath = path.resolve(__dirname, `../storage/local/images/invoice/${fileName}.png`)

  await page.screenshot({
    path: targetPath,
    clip: { x, y, width, height }
  })

  await browser.close()
}

module.exports = { urlToImage }
