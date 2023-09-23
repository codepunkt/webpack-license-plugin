import { resolve, sep } from 'node:path'
import type IFileSystem from './types/IFileSystem'
import type IModuleDirectoryLocator from './types/IModuleDirectoryLocator'
import type IPackageJsonReader from './types/IPackageJsonReader'

/**
 * Locates module directories for given filenames by searching
 * the directory tree for package.json files.
 */

export default class ModuleDirectoryLocator implements IModuleDirectoryLocator {
  constructor(
    private fileSystem: IFileSystem,
    private buildRoot: string,
    private packageJsonReader: IPackageJsonReader
  ) {}

  public getModuleDir(filename: string): string | null {
    const moduleDir = filename.substring(0, filename.lastIndexOf(sep))
    return this.checkModuleDir(moduleDir)
  }

  private checkModuleDir(
    moduleDir: string,
    prevModuleDir: string | null = null
  ): string | null {
    const checkParent = () =>
      this.checkModuleDir(resolve(`${moduleDir}${sep}..${sep}`), moduleDir)

    const isNotPartOfPackage =
      moduleDir === prevModuleDir || moduleDir === this.buildRoot
    if (isNotPartOfPackage) {
      return null
    }

    const hasPackageJson = this.fileSystem.pathExists(
      `${moduleDir}${sep}package.json`
    )
    if (!hasPackageJson) {
      return checkParent()
    }

    const packageMeta = this.packageJsonReader.readPackageJson(moduleDir)
    if (packageMeta.name === undefined || packageMeta.version === undefined) {
      return checkParent()
    }

    return moduleDir
  }
}
