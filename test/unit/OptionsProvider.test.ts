import defaultOptions from '../../src/defaultOptions'
import OptionsProvider from '../../src/OptionsProvider'

describe('OptionsProvider', () => {
  let handleError

  beforeEach(() => {
    handleError = jest.fn()
  })

  describe('getOptions', () => {
    test('validates options', () => {
      const instance = new OptionsProvider()
      const validateOptions = jest.spyOn(instance, 'validateOptions')
      const options = {
        licenseOverrides: { 'module@1.0.0': 'MIT' },
        outputFilename: 'bom.json',
      }
      instance.getOptions(options, handleError)

      expect(validateOptions).toHaveBeenCalledTimes(1)
      expect(validateOptions).toHaveBeenCalledWith(options, handleError)
    })

    test('applies defaultOptions', () => {
      const instance = new OptionsProvider()

      expect(instance.getOptions({}, handleError)).toEqual(defaultOptions)
    })
  })

  describe('validateOptions', () => {
    test("doesn't call handleError on valid licenseOverrides spdx expression", () => {
      const instance = new OptionsProvider()
      instance.validateOptions(
        {
          licenseOverrides: { 'module@1.0.0': 'MIT' },
        },
        handleError
      )

      expect(handleError).toHaveBeenCalledTimes(0)
    })

    test('calls handleError on invalid licenseOverrides spdx expression', () => {
      const instance = new OptionsProvider()
      instance.validateOptions(
        {
          licenseOverrides: { 'module@1.0.0': 'Apache 2.0' },
        },
        handleError
      )

      expect(handleError).toHaveBeenCalledTimes(1)
      expect(handleError).toHaveBeenCalledWith(
        new Error(
          'WebpackLicensePlugin: "Apache 2.0" in licenseOverrides option is not a valid SPDX expression!'
        )
      )
    })
  })
})
