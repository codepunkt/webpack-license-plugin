const compileWebpack = require('./testUtils').compileWebpack
const emptyOptions = require('../example/empty/webpack.config')
const basicOptions = require('../example/basic/webpack.config')
const blacklistOptions = require('../example/blacklisted-licenses/webpack.config')
const fs = require('fs')

jest.setTimeout(30000)

describe('WebpackLicensePlugin', () => {
  test("empty example doesn't emit a file", async () => {
    const stats = await compileWebpack(emptyOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(false)
  })

  test('basic example emits a file with the right contents', async () => {
    const stats = await compileWebpack(basicOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(true)
    const file = fs.readFileSync('./example/basic/public/oss-licenses.json').toString()
    expect(file).toMatchSnapshot()
  })

  test('blacklisted-licenses example throws', async () => {
    const compile = async () => await compileWebpack(blacklistOptions)
    await expect(compile()).rejects.toThrow(/WebpackLicensePlugin: found blacklisted license "MIT"/)
  })
})
