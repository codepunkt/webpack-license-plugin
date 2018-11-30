// @ts-ignore
import * as validate from 'spdx-expression-validate'
import * as webpack from 'webpack'

export interface IWebpackLicensePluginOptions {
  additionalFiles?: { [filename: string]: (output: string) => string }
  licenseOverrides?: { [packageVersion: string]: string }
  outputFilename?: string
  outputTransform?: (output: string) => string
  unacceptableLicenseTest?: (license: string) => boolean
}

export default class PluginOptionsProvider {
  private defaultOptions = {
    additionalFiles: {},
    licenseOverrides: {},
    outputFilename: 'oss-licenses.json',
    outputTransform: a => a,
    unacceptableLicenseTest: () => false,
  }

  constructor(private compilation: webpack.compilation.Compilation) {}

  public getOptions(
    pluginOptions: IWebpackLicensePluginOptions
  ): IWebpackLicensePluginOptions {
    this.validateOptions(pluginOptions)
    const options = { ...this.defaultOptions, ...pluginOptions }
    return options
  }

  private validateOptions(pluginOptions: IWebpackLicensePluginOptions) {
    if (pluginOptions.licenseOverrides) {
      for (const packageVersion of Object.keys(
        pluginOptions.licenseOverrides
      )) {
        if (!validate(pluginOptions.licenseOverrides[packageVersion])) {
          this.compilation.errors.push(
            new Error(
              `WebpackLicensePlugin: "${
                pluginOptions.licenseOverrides[packageVersion]
              }" in licenseOverrides option is not a valid SPDX expression!`
            )
          )
        }
      }
    }
  }
}
