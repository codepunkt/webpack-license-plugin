import validate from 'spdx-expression-validate'
import defaultOptions from './defaultOptions'
import type IAlertAggregator from './types/IAlertAggregator'
import type IPluginOptions from './types/IPluginOptions'

export default class OptionsProvider {
  constructor(private readonly alertAggregator: IAlertAggregator) {}

  public getOptions(inputOptions: Partial<IPluginOptions>): IPluginOptions {
    this.validateOptions(inputOptions)
    const options = { ...defaultOptions, ...inputOptions }
    return options
  }

  public validateOptions(inputOptions: Partial<IPluginOptions>) {
    if (inputOptions.additionalFiles) {
      for (const fileName of Object.keys(inputOptions.additionalFiles)) {
        if (typeof inputOptions.additionalFiles[fileName] !== 'function') {
          this.alertAggregator.addError(
            `Invalid additionalFiles option: Value for key "${fileName}" is not a function!`,
          )
        }
      }
    }

    if (inputOptions.licenseOverrides) {
      for (const packageVersion of Object.keys(inputOptions.licenseOverrides)) {
        if (!validate(inputOptions.licenseOverrides[packageVersion])) {
          this.alertAggregator.addError(
            `Invalid licenseOverrides option: "${inputOptions.licenseOverrides[packageVersion]}" is not a valid SPDX expression!`,
          )
        }
      }
    }

    if (
      inputOptions.replenishDefaultLicenseTexts
      && typeof inputOptions.replenishDefaultLicenseTexts !== 'boolean'
    ) {
      this.alertAggregator.addError(
        `Invalid replenishDefaultLicenseTexts option: Not a boolean!`,
      )
    }

    if (
      inputOptions.includePackages
      && typeof inputOptions.includePackages !== 'function'
    ) {
      this.alertAggregator.addError(
        `Invalid includePackages option: Not a function!`,
      )
    }
  }
}
