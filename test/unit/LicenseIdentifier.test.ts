import LicenseIdentifier from '../../src/LicenseIdentifier'

describe('LicenseIdentifier', () => {
  test('throws when no license information exists', () => {
    const licenseIdentifier = new LicenseIdentifier()

    expect(() =>
      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0' },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
    ).toThrow(/no license found/)
    expect(() =>
      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0', licenses: [] },
        { licenseOverrides: {}, unacceptableLicenseTest: () => false }
      )
    ).toThrow(/no license found/)
  })

  test('throws when unacceptableLicenseTest takes effect', () => {
    const licenseIdentifier = new LicenseIdentifier()

    expect(() =>
      licenseIdentifier.identifyLicense(
        { name: 'foo', version: '1.0.0', license: 'MIT' },
        { licenseOverrides: {}, unacceptableLicenseTest: () => true }
      )
    ).toThrow(/found unacceptable license/)
  })

  test('reads license from `license` field', () => {
    const licenseIdentifier = new LicenseIdentifier()

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
    const licenseIdentifier = new LicenseIdentifier()
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

  test('reads preferred license from `licenses` field', () => {
    const licenseIdentifier = new LicenseIdentifier(['MIT'])
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
    const licenseIdentifier = new LicenseIdentifier()
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
    const licenseIdentifier = new LicenseIdentifier()
    const result = licenseIdentifier.identifyLicense(
      { name: 'foo', version: '1.0.0' },
      {
        licenseOverrides: { 'foo@1.0.0': 'bar' },
        unacceptableLicenseTest: () => false,
      }
    )
    expect(result).toBe('bar')
  })
})
