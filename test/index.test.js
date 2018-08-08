const runWebpack = require('./util/runWebpack')
const LicensePlugin = require('../lib')

jest.setTimeout(30000)

let consoleLogSpy

beforeEach(() => {
  consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation()
})

describe('WebpackLicensePlugin', () => {
  it('doesnt emit a file when no deps are found', async () => {
    const result = await runWebpack({}, './src/empty.js')
    expect(result).toBe(null)
  })

  it('logs when no deps are found', async () => {
    await runWebpack({}, './src/empty.js')
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /WebpackLicensePlugin found no OSS licensed packages/
    )
  })

  it('doesnt log when no deps are found with logLevel none', async () => {
    await runWebpack({ logLevel: 'none' }, './src/empty.js')
    expect(consoleLogSpy).toHaveBeenCalledTimes(0)
  })

  it('matches the snapshot when deps are found', async () => {
    const result = await runWebpack()
    expect(result).not.toBe(null)
    expect(result).toMatchSnapshot()
  })

  it('logs when deps are found', async () => {
    await runWebpack()
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /WebpackLicensePlugin found 10 OSS licensed packages/
    )
  })

  it('doesnt log when deps are found with logLevel none', async () => {
    await runWebpack({ logLevel: 'none', fileName: 'oss.json' })
    expect(consoleLogSpy).toHaveBeenCalledTimes(0)
  })

  it('logs more when deps are found with logLevel verbose', async () => {
    await runWebpack({ logLevel: 'verbose', fileName: 'oss.json' })
    expect(consoleLogSpy).toHaveBeenCalledTimes(2)
    expect(consoleLogSpy.mock.calls[0][0]).toMatch(
      /WebpackLicensePlugin found 10 OSS licensed packages/
    )
    expect(consoleLogSpy.mock.calls[1][0]).toMatch(
      /| name\s* | version\s* | license\s* |/
    )
  })

  it('throws when encountering blacklisted licenses', async () => {
    const compile = async () => await runWebpack({ blacklist: ['MIT'] })
    await expect(compile()).rejects.toThrow(
      /WebpackLicensePlugin: found blacklisted license "MIT"/
    )
  })

  it('throws when constructed with an unknown logLevel', async () => {
    expect(() => new LicensePlugin({ logLevel: 'test' })).toThrow(
      /unknown logLevel/
    )
  })

  it('throws when fileName is not a string', async () => {
    expect(() => new LicensePlugin({ fileName: [] })).toThrow(
      /fileName is empty or not a string/
    )
  })

  it('throws when fileName is empty', async () => {
    expect(() => new LicensePlugin({ fileName: '' })).toThrow(
      /fileName is empty or not a string/
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
