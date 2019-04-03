import LicenseIdentifier from '../../src/LicenseIdentifier'
import IAlertAggregator from '../../src/types/IAlertAggregator'

const MockAlertAggregator = jest.fn<IAlertAggregator, any[]>(i => i)

describe('LicenseIdentifier', () => {
  describe('identifyLicense', () => {
    test('adds error when no license info was found', () => {
      const addError = jest.fn()
      const licenseIdentifier = new LicenseIdentifier(
        new MockAlertAggregator({ addError })
      )

      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0' },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
      licenseIdentifier.identifyLicense(
        { name: 'bar', version: '1.0.0', licenses: [] },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )

      expect(addError).toHaveBeenCalledTimes(2)
      expect(addError).toHaveBeenNthCalledWith(
        1,
        'Could not find license info for foo@1.0.0'
      )
      expect(addError).toHaveBeenNthCalledWith(
        2,
        'Could not find license info for bar@1.0.0'
      )
    })

    test('adds error when unacceptableLicenseTest takes effect', () => {
      const addError = jest.fn()
      const licenseIdentifier = new LicenseIdentifier(
        new MockAlertAggregator({ addError })
      )

      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0', license: 'MIT' },
        { licenseOverrides: {}, unacceptableLicenseTest: () => true }
      )
      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenNthCalledWith(
        1,
        'Found unacceptable license "MIT" for foo@1.0.0'
      )
    })

    test('reads license from `license` field', () => {
      const licenseIdentifier = new LicenseIdentifier(new MockAlertAggregator())

      expect(
        licenseIdentifier.identifyLicense(
          {
            name: 'foo',
            version: '1.0.0',
            license: 'Apache-2.0',
          },
          { licenseOverrides: {}, unacceptableLicenseTest: () => false }
        )
      ).toBe('Apache-2.0')
    })

    test('reads license from object version of `license` field', () => {
      const licenseIdentifier = new LicenseIdentifier(new MockAlertAggregator())
      const result = licenseIdentifier.identifyLicense(
        {
          name: 'foo',
          version: '1.0.0',
          license: { type: 'ISC', url: 'http://example.com/' },
        },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
      expect(result).toBe('ISC')
    })

    test('reads license from string version of `licenses` field', () => {
      const licenseIdentifier = new LicenseIdentifier(new MockAlertAggregator())
      const result = licenseIdentifier.identifyLicense(
        {
          name: 'foo',
          version: '1.0.0',
          // @ts-ignore
          licenses: 'ISC',
        },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
      expect(result).toBe('ISC')
    })

    test('reads preferred license from `licenses` field', () => {
      const licenseIdentifier = new LicenseIdentifier(
        new MockAlertAggregator(),
        ['MIT']
      )
      const result = licenseIdentifier.identifyLicense(
        {
          name: 'foo',
          version: '1.0.0',
          licenses: [
            { type: 'ISC', url: 'http://example.com/' },
            { type: 'MIT', url: 'http://example.com/' },
          ],
        },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
      expect(result).toBe('MIT')
    })

    test('reads first license from `licenses` field when no preferred licenses are given', () => {
      const licenseIdentifier = new LicenseIdentifier(new MockAlertAggregator())
      const result = licenseIdentifier.identifyLicense(
        {
          name: 'foo',
          version: '1.0.0',
          licenses: [
            { type: 'ISC', url: 'http://example.com/' },
            { type: 'MIT', url: 'http://example.com/' },
          ],
        },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
      expect(result).toBe('ISC')
    })

    test('respects licenseOverrides', () => {
      const licenseIdentifier = new LicenseIdentifier(new MockAlertAggregator())

      const result = licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0' },
        {
          licenseOverrides: { 'foo@1.0.0': 'MIT' },
          unacceptableLicenseTest: () => false,
        }
      )

      expect(result).toBe('MIT')
    })

    test('errors when identifier license is not a valid spdx expression', () => {
      const addError = jest.fn()
      const licenseIdentifier = new LicenseIdentifier(
        new MockAlertAggregator({ addError })
      )

      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0', license: 'Apache 2.0' },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )

      expect(addError).toHaveBeenCalledTimes(1)
    })
  })
})
