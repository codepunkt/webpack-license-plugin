import { IPluginOptions } from '../OptionsProvider'
import IPackageJson from './IPackageJson'

export default interface ILicenseIdentifier {
  identifyLicense(
    meta: IPackageJson,
    options: Pick<
      IPluginOptions,
      'licenseOverrides' | 'unacceptableLicenseTest'
    >
  ): string
}
