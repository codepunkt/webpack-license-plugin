import defaultOptions from '../../src/defaultOptions'
import OptionsProvider from '../../src/OptionsProvider'
import IAlertAggregator from '../../src/types/IAlertAggregator'

const MockAlertAggregator = jest.fn<IAlertAggregator>(i => i)

describe('OptionsProvider', () => {
  describe('getOptions', () => {
    test('applies defaultOptions', () => {
      const instance = new OptionsProvider(new MockAlertAggregator())

      expect(instance.getOptions({})).toEqual(defaultOptions)
    })
  })

  describe('validateOptions', () => {
    test("doesn't add an error on valid licenseOverrides spdx expression", () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError })
      )

      instance.validateOptions({
        licenseOverrides: { 'module@1.0.0': 'MIT' },
      })

      expect(addError).toHaveBeenCalledTimes(0)
    })

    test('calls handleError on invalid licenseOverrides spdx expression', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError })
      )

      instance.validateOptions({
        licenseOverrides: { 'module@1.0.0': 'Apache 2.0' },
      })

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'Invalid licenseOverrides option: "Apache 2.0" is not a valid SPDX expression!'
      )
    })
  })
})
