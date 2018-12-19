import IPackageLicenseMeta from './IPackageLicenseMeta'

export default interface IPluginOptions {
  additionalFiles: {
    [filename: string]: (
      packages: IPackageLicenseMeta[]
    ) => string | Promise<string>
  }
  defaultLicenseTextDir: string | null
  licenseOverrides: { [packageVersion: string]: string }
  outputFilename: string
  replenishDefaultLicenseTexts: boolean
  unacceptableLicenseTest: (license: string) => boolean
}
