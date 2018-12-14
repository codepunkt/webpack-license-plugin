// @ts-ignore
import * as validate from 'spdx-expression-validate'
import defaultOptions from './defaultOptions'

export interface IPluginOptions {
  additionalFiles: {
    [filename: string]: (output: string) => string | Promise<string>
  }
  licenseOverrides: { [packageVersion: string]: string }
  outputFilename: string
  unacceptableLicenseTest: (license: string) => boolean
}

export default class OptionsProvider {
  public getOptions(
    inputOptions: Partial<IPluginOptions>,
    handleError: (err: Error) => void
  ): IPluginOptions {
    this.validateOptions(inputOptions, handleError)
    const options = { ...defaultOptions, ...inputOptions }
    return options
  }

  public validateOptions(
    inputOptions: Partial<IPluginOptions>,
    handleError: (err: Error) => void
  ) {
    if (inputOptions.licenseOverrides) {
      for (const packageVersion of Object.keys(inputOptions.licenseOverrides)) {
        if (!validate(inputOptions.licenseOverrides[packageVersion])) {
          handleError(
            new Error(
              `WebpackLicensePlugin: "${
                inputOptions.licenseOverrides[packageVersion]
              }" in licenseOverrides option is not a valid SPDX expression!`
            )
          )
        }
      }
    }
  }
}
