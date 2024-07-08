import type IPackageJson from './IPackageJson'
import type IPluginOptions from './IPluginOptions'

export default interface ILicenseIdentifier {
  identifyLicense: (
    meta: IPackageJson,
    options: Pick<
      IPluginOptions,
      'licenseOverrides' | 'unacceptableLicenseTest'
    >
  ) => string
}
