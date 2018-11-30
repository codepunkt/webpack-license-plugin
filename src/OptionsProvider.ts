// @ts-ignore
import * as validate from 'spdx-expression-validate'

export interface IPluginOptions {
  additionalFiles: { [filename: string]: (output: string) => string }
  licenseOverrides: { [packageVersion: string]: string }
  outputFilename: string
  outputTransform: (output: string) => string
  unacceptableLicenseTest: (license: string) => boolean
}

export default class OptionsProvider {
  private defaultOptions: IPluginOptions = {
    additionalFiles: {},
    licenseOverrides: {},
    outputFilename: 'oss-licenses.json',
    outputTransform: a => a,
    unacceptableLicenseTest: () => false,
  }

  constructor(private handleError: (err: Error) => void) {}

  public getOptions(inputOptions: Partial<IPluginOptions>): IPluginOptions {
    this.validateOptions(inputOptions)
    const options = { ...this.defaultOptions, ...inputOptions }
    return options
  }

  private validateOptions(inputOptions: Partial<IPluginOptions>) {
    if (inputOptions.licenseOverrides) {
      for (const packageVersion of Object.keys(inputOptions.licenseOverrides)) {
        if (!validate(inputOptions.licenseOverrides[packageVersion])) {
          this.handleError(
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
