import type IPackageLicenseMeta from './IPackageLicenseMeta'

export default interface ILicenseMetaAggregator {
  aggregateMeta: (moduleDirs: string[]) => Promise<IPackageLicenseMeta[]>
}
