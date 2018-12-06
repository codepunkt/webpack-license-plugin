import { IPluginOptions } from '../OptionsProvider'

export default interface ILicenseMetaAggregator {
  aggregateMeta(moduleDirs: string[], options: IPluginOptions)
}
