import { IPluginOptions } from './OptionsProvider'

const defaultOptions: IPluginOptions = {
  additionalFiles: {},
  licenseOverrides: {},
  outputFilename: 'oss-licenses.json',
  unacceptableLicenseTest: () => false,
}

export default defaultOptions
