import IPluginOptions from './types/IPluginOptions'

const defaultOptions: IPluginOptions = {
  additionalFiles: {},
  licenseOverrides: {},
  outputFilename: 'oss-licenses.json',
  replenishDefaultLicenseTexts: false,
  unacceptableLicenseTest: () => false,
  excludedPackageTest: () => false,
}

export default defaultOptions
