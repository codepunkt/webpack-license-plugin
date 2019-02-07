import { join } from 'path'
import IAlertAggregator from './types/IAlertAggregator'
import IFileSystem from './types/IFileSystem'
import IPackageJson from './types/IPackageJson'

/**
 * Reads license text.
 *
 * @todo read fallback licenses from directory
 * @todo read fallback licenses from spdx.org
 */
export default class LicenseTextReader {
  constructor(
    private alertAggregator: IAlertAggregator,
    private fileSystem: IFileSystem
  ) {}

  public readLicenseText(
    meta: IPackageJson,
    license: string,
    moduleDir: string
  ): string | null {
    const id = `${meta.name}@${meta.version}`

    if (license.indexOf('SEE LICENSE IN ') === 0) {
      const filename = license.split(' ')[3]
      try {
        return this.readFile(moduleDir, filename)
      } catch (e) {
        this.alertAggregator.addError(
          `could not find file specified in package.json license field of ${id}`
        )
      }
    }

    const pathsInModuleDir = this.fileSystem.listPaths(moduleDir)
    const licenseFilename = this.getLicenseFilename(pathsInModuleDir)

    if (licenseFilename !== null) {
      return this.readFile(moduleDir, licenseFilename)
    }

    return null
  }

  public getLicenseFilename(paths: string[]): string | null {
    for (const path of paths) {
      if (/^licen[cs]e/i.test(path)) {
        return path
      }
    }
    return null
  }

  public readFile(directory: string, filename: string): string {
    return this.fileSystem
      .readFile(join(directory, filename))
      .replace(/\r\n/g, '\n')
  }
}
