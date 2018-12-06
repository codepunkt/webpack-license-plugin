import { IPluginOptions } from './OptionsProvider'

const defaultOptions: IPluginOptions = {
  additionalFiles: {},
  licenseOverrides: {},
  outputFilename: 'oss-licenses.json',
  outputTransform: a => a,
  unacceptableLicenseTest: () => false,
}

export default defaultOptions
