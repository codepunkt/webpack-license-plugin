import { sep } from 'path'
import IFileSystem from './types/IFileSystem'

export default class ModuleDirectoryLocator {
  constructor(private fileSystem: IFileSystem, private buildRoot: string) {}

  public getModuleDir(filename: string): string | null {
    let moduleDir = filename.substring(0, filename.lastIndexOf(sep))
    let prevModuleDir: string | null = null

    while (
      !this.fileSystem.pathExists(
        this.fileSystem.join(moduleDir, 'package.json')
      )
    ) {
      // check parent directory
      prevModuleDir = moduleDir
      moduleDir = this.fileSystem.resolve(`${moduleDir}${sep}..${sep}`)

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
