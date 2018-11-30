import { IWebpackLicensePluginOptions } from './PluginOptionsProvider';
import IPackageJson from './types/IPackageJson';
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
    private preferredLicenseTypes;
    constructor(preferredLicenseTypes: string[]);
    identifyLicense(packageJson: IPackageJson, options: IWebpackLicensePluginOptions): string | null;
    private findPreferredLicense;
}
