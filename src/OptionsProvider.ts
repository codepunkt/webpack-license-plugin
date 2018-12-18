// @ts-ignore
import * as validate from 'spdx-expression-validate'
import defaultOptions from './defaultOptions'
import IAlertAggregator from './types/IAlertAggregator'
import IPluginOptions from './types/IPluginOptions'

export default class OptionsProvider {
  constructor(private readonly alertAggregator: IAlertAggregator) {}

  public getOptions(inputOptions: Partial<IPluginOptions>): IPluginOptions {
    this.validateOptions(inputOptions)
    const options = { ...defaultOptions, ...inputOptions }
    return options
  }

  public validateOptions(inputOptions: Partial<IPluginOptions>) {
    if (inputOptions.licenseOverrides) {
      for (const packageVersion of Object.keys(inputOptions.licenseOverrides)) {
        if (!validate(inputOptions.licenseOverrides[packageVersion])) {
          this.alertAggregator.addError(
            `Invalid licenseOverrides option: "${
              inputOptions.licenseOverrides[packageVersion]
            }" is not a valid SPDX expression!`
          )
        }
      }
    }
  }
}
