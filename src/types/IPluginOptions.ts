import type IPackageLicenseMeta from './IPackageLicenseMeta'

export default interface IPluginOptions {
  additionalFiles: {
    [filename: string]: (
      packages: IPackageLicenseMeta[]
    ) => string | Promise<string>
  }
  licenseOverrides: { [packageVersion: string]: string }
  outputFilename: string
  replenishDefaultLicenseTexts: boolean
  includeNoticeText: boolean
  unacceptableLicenseTest: (licenseIdentifier: string) => boolean
  excludedPackageTest: (packageName: string, packageVersion: string) => boolean
  includePackages: () => string[] | Promise<string[]>
}
