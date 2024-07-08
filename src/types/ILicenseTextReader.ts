import type IPackageJson from './IPackageJson'

export default interface ILicenseTextReader {
  readLicenseText: (
    meta: IPackageJson,
    license: string,
    moduleDir: string
  ) => Promise<string | null>
}
