import validate from 'spdx-expression-validate'
import type IAlertAggregator from './types/IAlertAggregator'
import type IPackageJson from './types/IPackageJson'
import type IPluginOptions from './types/IPluginOptions'

/**
 * Identifies license type based on package.json and selects
 * preferred license type if multiple are found
 */
export default class LicenseIdentifier {
  constructor(
    private alertAggregator: IAlertAggregator,
    private readonly preferredLicenses: string[] = [],
  ) {}

  public identifyLicense(
    meta: IPackageJson,
    options: Pick<
      IPluginOptions,
      'licenseOverrides' | 'unacceptableLicenseTest'
    >,
  ): string | null {
    const id = `${meta.name}@${meta.version}`
    let license: string

    if (options.licenseOverrides[id]) {
      license = options.licenseOverrides[id]
    }
    else if (typeof meta.license === 'object') {
      license = meta.license.type
    }
    else if (meta.license) {
      license = meta.license
    }
    else if (Array.isArray(meta.licenses) && meta.licenses.length > 0) {
      // handle deprecated `licenses` field
      license
        = this.findPreferredLicense(meta.licenses.map(l => l.type))
        || meta.licenses[0].type
    }
    else if (typeof meta.licenses === 'string') {
      // handle invalid string values for deprecated `licenses` field
      // unfortunately, these are rather common
      license = meta.licenses
    }

    if (!license) {
      this.alertAggregator.addError(`Could not find license info for ${id}`)
    }
    else if (options.unacceptableLicenseTest(license)) {
      this.alertAggregator.addError(
        `Found unacceptable license "${license}" for ${id}`,
      )
    }
    else if (!validate(license)) {
      this.alertAggregator.addError(
        `License "${license}" for ${id} is not a valid SPDX expression!`,
      )
    }

    return license || null
  }

  private findPreferredLicense(licenseTypes: string[]): string | null {
    for (const preferredLicenseType of this.preferredLicenses) {
      for (const licenseType of licenseTypes) {
        if (preferredLicenseType === licenseType) {
          return preferredLicenseType
        }
      }
    }
    return null
  }
}
