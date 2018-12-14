import IPackageLicenseMeta from './IPackageLicenseMeta'
import IPluginOptions from './IPluginOptions'

export default interface ILicenseMetaAggregator {
  aggregateMeta(
    moduleDirs: string[],
    options: IPluginOptions
  ): IPackageLicenseMeta[]
}
