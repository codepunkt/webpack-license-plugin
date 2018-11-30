import { IWebpackLicensePluginOptions } from './PluginOptionsProvider'
import IPackageJson from './types/IPackageJson'

/**
 * Identifies license type based on package.json and selects
 * preferred if multiple are found
 *
 * @todo handle "SEE LICENSE IN" `license` fields
 * @see https://docs.npmjs.com/files/package.json#license
 *
 * @todo handle spdx OR case
 *
 * @todo handle license ambiguity via option (default to choosing the first)
 */
export default class LicenseIdentifier {
  constructor(private preferredLicenseTypes: string[]) {}

  public identifyLicense(
    packageJson: IPackageJson,
    options: IWebpackLicensePluginOptions
  ): string | null {
    const packageIdentifier = `${packageJson.name}@${packageJson.version}`
    if (options.licenseOverrides[packageIdentifier]) {
      return options.licenseOverrides[packageIdentifier]
    }

    if (typeof packageJson.license === 'object') {
      return packageJson.license.type
    } else if (packageJson.license) {
      return packageJson.license
    }

    // handle deprecated `licenses` field
    if (
      Array.isArray(packageJson.licenses) &&
      packageJson.licenses.length > 0
    ) {
      return (
        this.findPreferredLicense(
          packageJson.licenses.map(license => license.type),
          this.preferredLicenseTypes
        ) || packageJson.licenses[0].type
      )
    }

    return null
  }

  private findPreferredLicense(
    licenseTypes: string[],
    preferredLicenseTypes: string[]
  ): string | null {
    for (const preferredLicenseType of preferredLicenseTypes) {
      for (const licenseType of licenseTypes) {
        if (preferredLicenseType === licenseType) {
          return preferredLicenseType
        }
      }
    }
    return null
  }
}
