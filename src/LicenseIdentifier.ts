import IPackageJson from './types/IPackageJson'
import IPluginOptions from './types/IPluginOptions'

/**
 * Identifies license type based on package.json and selects
 * preferred license type if multiple are found
 *
 * @todo handle "SEE LICENSE IN" `license` fields
 * @see https://docs.npmjs.com/files/package.json#license
 *
 * @todo handle spdx OR case
 *
 * @todo handle license ambiguity via option (default to choosing the first)
 */
export default class LicenseIdentifier {
  constructor(private preferredLicenses: string[] = []) {}

  public identifyLicense(
    meta: IPackageJson,
    options: Pick<
      IPluginOptions,
      'licenseOverrides' | 'unacceptableLicenseTest'
    >
  ): string {
    const id = `${meta.name}@${meta.version}`
    let license: string

    if (options.licenseOverrides[id]) {
      license = options.licenseOverrides[id]
    } else if (typeof meta.license === 'object') {
      license = meta.license.type
    } else if (meta.license) {
      license = meta.license
    } else if (Array.isArray(meta.licenses) && meta.licenses.length > 0) {
      // handle deprecated `licenses` field
      license =
        this.findPreferredLicense(
          meta.licenses.map(l => l.type),
          this.preferredLicenses
        ) || meta.licenses[0].type
    }

    if (!license) {
      throw new Error(`no license found for ${id}`)
    }

    if (options.unacceptableLicenseTest(license)) {
      throw new Error(
        `WebpackLicensePlugin: found unacceptable license "${license}" for ${id}`
      )
    }

    return license
  }

  private findPreferredLicense(
    licenseTypes: string[],
    preferredLicenses: string[]
  ): string | null {
    for (const preferredLicenseType of preferredLicenses) {
      for (const licenseType of licenseTypes) {
        if (preferredLicenseType === licenseType) {
          return preferredLicenseType
        }
      }
    }
    return null
  }
}
