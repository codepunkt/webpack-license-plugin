import getSummary from '../src/getSummary'

describe('getSummary', () => {
  test('empty summary', () => {
    const licenseInfo = []
    expect(getSummary(licenseInfo)).toEqual({})
  })

  test('non-empty summary', () => {
    const licenseInfo = [
      { license: 'MIT' },
      { license: 'MIT*' },
      { license: 'MIT' },
      { license: 'BSD-3-Clause' },
    ]

    expect(getSummary(licenseInfo)).toEqual({
      'BSD-3-Clause': 1,
      MIT: 2,
      'MIT*': 1,
    })
  })
})
