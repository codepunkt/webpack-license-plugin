import IPluginOptions from './types/IPluginOptions'

const defaultOptions: IPluginOptions = {
  additionalFiles: {},
  licenseOverrides: {},
  outputFilename: 'oss-licenses.json',
  unacceptableLicenseTest: () => false,
}

export default defaultOptions
