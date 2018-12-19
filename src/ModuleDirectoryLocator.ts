import { join, resolve, sep } from 'path'
import IFileSystem from './types/IFileSystem'
import IModuleDirectoryLocator from './types/IModuleDirectoryLocator'

/**
 * Locates module directories for given filenames by searching
 * the directory tree for package.json files.
 */
export default class ModuleDirectoryLocator implements IModuleDirectoryLocator {
  constructor(private fileSystem: IFileSystem, private buildRoot: string) {}

  public getModuleDir(filename: string): string | null {
    let moduleDir = filename.substring(0, filename.lastIndexOf(sep))
    let prevModuleDir: string | null = null

    while (!this.fileSystem.pathExists(join(moduleDir, 'package.json'))) {
      // check parent directory
      prevModuleDir = moduleDir
      moduleDir = resolve(`${moduleDir}${sep}..${sep}`)

      // reached filesystem root
      if (prevModuleDir === moduleDir) {
        // @todo file does not belong to a module. throw?
        return null
      }
    }

    if (this.buildRoot === moduleDir) {
      return null
    }

    return moduleDir
  }
}
