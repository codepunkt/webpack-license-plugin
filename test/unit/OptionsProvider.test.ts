import defaultOptions from '../../src/defaultOptions'
import OptionsProvider from '../../src/OptionsProvider'
import type IAlertAggregator from '../../src/types/IAlertAggregator'

const MockAlertAggregator = jest.fn<IAlertAggregator, any[]>(i => i)

describe('optionsProvider', () => {
  describe('getOptions', () => {
    it('applies defaultOptions', () => {
      const instance = new OptionsProvider(new MockAlertAggregator())

      expect(instance.getOptions({})).toEqual(defaultOptions)
    })
  })

  describe('validateOptions', () => {
    it('doesn\'t add an error on valid licenseOverrides spdx expression', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError }),
      )

      instance.validateOptions({
        licenseOverrides: { 'module@1.0.0': 'MIT' },
      })

      expect(addError).toHaveBeenCalledTimes(0)
    })

    it('errors on invalid licenseOverrides spdx expression', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError }),
      )

      instance.validateOptions({
        licenseOverrides: { 'module@1.0.0': 'Apache 2.0' },
      })

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'Invalid licenseOverrides option: "Apache 2.0" is not a valid SPDX expression!',
      )
    })

    it('errors on invalid return type for additionalFile contents', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError }),
      )

      instance.validateOptions({
        additionalFiles: {
          'foo.json': () => 'foo',
          'bar.json': () => Promise.resolve('bar'),
          // @ts-expect-error not a function
          'baz.json': 'baz',
        },
      })

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'Invalid additionalFiles option: Value for key "baz.json" is not a function!',
      )
    })

    it('errors on invalid type for replenishDefaultLicenseTexts option', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError }),
      )

      // @ts-expect-error not a boolean
      instance.validateOptions({ replenishDefaultLicenseTexts: 'foo' })

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'Invalid replenishDefaultLicenseTexts option: Not a boolean!',
      )
    })

    it('errors on invalid type for includePackages option', () => {
      const addError = jest.fn()
      const instance = new OptionsProvider(
        new MockAlertAggregator({ addError }),
      )

      // @ts-expect-error not a function
      instance.validateOptions({ includePackages: 'foo' })

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'Invalid includePackages option: Not a function!',
      )
    })
  })
})
