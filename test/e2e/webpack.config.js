const { resolve } = require('path')
const WebpackLicensePlugin = require('../../dist/index')

module.exports = {
  entry: resolve(__dirname, './example/src/index.js'),
  output: {
    path: resolve(__dirname, './example/dist'),
  },
  target: 'node',
  mode: 'development',
  plugins: [new WebpackLicensePlugin({ replenishDefaultLicenseTexts: true })],
}
