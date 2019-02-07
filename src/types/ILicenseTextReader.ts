import IPackageJson from './IPackageJson'

export default interface ILicenseTextReader {
  readLicenseText(
    meta: IPackageJson,
    license: string,
    moduleDir: string
  ): string | null
}
