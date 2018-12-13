import { join } from 'path'
import IFileSystem from './types/IFileSystem'
import IPackageJson from './types/IPackageJson'

interface IPackageJsonCache {
  [moduleDir: string]: IPackageJson
}

export default class PackageJsonReader {
  private cache: IPackageJsonCache = {}

  constructor(private fileSystem: IFileSystem) {}

  public readPackageJson(moduleDir: string): IPackageJson {
    if (!this.cache[moduleDir]) {
      const path = join(moduleDir, 'package.json')
      const meta = JSON.parse(this.fileSystem.readFile(path))
      this.cache[moduleDir] = meta
    }

    return this.cache[moduleDir]
  }
}
