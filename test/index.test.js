const compileWebpack = require('./testUtils').compileWebpack
const emptyOptions = require('../example/empty/webpack.config')
const basicOptions = require('../example/basic/webpack.config')
const blacklistOptions = require('../example/blacklisted-licenses/webpack.config')
const unknownLicensefileOptions = require('../example/unknown-licensefile/webpack.config')
const overrideOptions = require('../example/overrides/webpack.config')
const fs = require('fs')
const LicensePlugin = require('../lib')

jest.setTimeout(30000)

describe('WebpackLicensePlugin', () => {
  it('doesnt emit a file when no packages are included in the output', async () => {
    const stats = await compileWebpack(emptyOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(false)
  })

  it('matches basic example snapshot', async () => {
    const stats = await compileWebpack(basicOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(true)
    const file = fs
      .readFileSync('./example/basic/public/oss-licenses.json')
      .toString()
    expect(file).toMatchSnapshot()
  })

  it('throws when encountering blacklisted licenses', async () => {
    const compile = async () => await compileWebpack(blacklistOptions)
    await expect(compile()).rejects.toThrow(
      /WebpackLicensePlugin: found blacklisted license "MIT"/
    )
  })

  it('works on packages with unknown licenseFiles', async () => {
    const stats = await compileWebpack(unknownLicensefileOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(true)
    const file = fs
      .readFileSync('./example/basic/public/oss-licenses.json')
      .toString()
    expect(file).toMatchSnapshot()
  })

  it('works on packages with unknown licenseFiles', async () => {
    const stats = await compileWebpack(overrideOptions)
    const files = stats.toJson().assets.map(x => x.name)

    expect(files.includes('oss-licenses.json')).toBe(true)
    const file = fs
      .readFileSync('./example/basic/public/oss-licenses.json')
      .toString()
    expect(file).toMatchSnapshot()
  })

  it('throws when constructed with an unknown logLevel', async () => {
    expect(() => new LicensePlugin({ logLevel: 'test' })).toThrow(
      /unknown logLevel/
    )
  })

  it('throws when blacklist is not an array', async () => {
    expect(() => new LicensePlugin({ blacklist: 'test' })).toThrow(
      /not an array/
    )
  })

  it('throws when overrides are not an object', async () => {
    expect(() => new LicensePlugin({ overrides: 'test' })).toThrow(
      /not an object/
    )
  })

  it('throws when overrides contain non valid spdx license expressions', async () => {
    expect(
      () => new LicensePlugin({ overrides: { 'package@1.0.0': 'Apache 2.0' } })
    ).toThrow(/not a valid spdx expression/)
  })
})
