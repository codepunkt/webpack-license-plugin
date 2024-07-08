import type IPackageJson from './IPackageJson'

export default interface IPackageJsonReader {
  readPackageJson: (moduleDir: string) => IPackageJson
}
