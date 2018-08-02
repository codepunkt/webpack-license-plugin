const compileWebpack = require('./testUtils').compileWebpack
const emptyExampleOptions = require('../example/empty/webpack.config')
const basicExampleOptions = require('../example/basic/webpack.config')
const fs = require('fs')

jest.setTimeout(30000)

describe('WebpackLicensePlugin', () => {
  test("empty example doesn't emit a licenses file", async () => {
    const stats = await compileWebpack(emptyExampleOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(false)
  })

  test('basic example', async () => {
    const stats = await compileWebpack(basicExampleOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(true)
    const file = fs.readFileSync('./example/basic/public/oss-licenses.json').toString()
    expect(file).toMatchSnapshot()
  })
})
