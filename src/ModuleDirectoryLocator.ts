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
    private packageJsonReader: IPackageJsonReader,
  ) {}

  public getModuleDir(filename: string): string | null {
    const moduleDir = filename.substring(0, filename.lastIndexOf(sep))
    return this.checkModuleDir(moduleDir)
  }

  private checkModuleDir(moduleDir: string): string | null {
    let dirWithVersion: string | null = null
    let dirWithLicense: string | null = null
    let prevModuleDir: string | null = null

    do {
      if (this.fileSystem.pathExists(`${moduleDir}${sep}package.json`)) {
        const packageMeta = this.packageJsonReader.readPackageJson(moduleDir)

        if (
          packageMeta.name !== undefined
          && packageMeta.version !== undefined
        ) {
          dirWithVersion = moduleDir

          if (
            packageMeta.license !== undefined
            || packageMeta.licenses !== undefined
          ) {
            dirWithLicense = moduleDir
          }
        }
      }

      prevModuleDir = moduleDir
      moduleDir = resolve(`${moduleDir}${sep}..${sep}`)
    } while (
      !dirWithLicense
      && moduleDir !== prevModuleDir
      && moduleDir !== this.buildRoot
    )

    return dirWithLicense || dirWithVersion
  }
}
