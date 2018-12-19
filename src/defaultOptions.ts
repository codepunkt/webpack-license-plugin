import IPluginOptions from './types/IPluginOptions'

const defaultOptions: IPluginOptions = {
  additionalFiles: {},
  defaultLicenseTextDir: null,
  licenseOverrides: {},
  outputFilename: 'oss-licenses.json',
  replenishDefaultLicenseTexts: false,
  unacceptableLicenseTest: () => false,
}

export default defaultOptions
