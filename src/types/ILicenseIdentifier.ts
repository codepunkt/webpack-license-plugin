import IPackageJson from './IPackageJson'
import IPluginOptions from './IPluginOptions'

export default interface ILicenseIdentifier {
  identifyLicense(
    meta: IPackageJson,
    options: Pick<
      IPluginOptions,
      'licenseOverrides' | 'unacceptableLicenseTest'
    >
  ): string
}
