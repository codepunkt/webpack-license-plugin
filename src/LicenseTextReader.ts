import WebpackFileSystem from './WebpackFileSystem'

/**
 *
 *
 * @todo read fallback licenses from directory
 * @todo read fallback licenses from spdx.org
 */
export default class LicenseTextReader {
  constructor(private fileSystem: WebpackFileSystem) {}

  public readLicenseText(license: string, moduleDir: string): string | null {
    if (license.indexOf('SEE LICENSE IN ') === 0) {
      const filename = license.split(' ')[3]
      return this.readFile(moduleDir, filename)
    }

    const pathsInModuleDir = this.fileSystem.listPaths(moduleDir)
    const licenseFilename = this.getLicenseFilename(pathsInModuleDir)

    if (licenseFilename !== null) {
      return this.readFile(moduleDir, licenseFilename)
    }

    return null
  }

  private getLicenseFilename(paths: string[]): string | null {
    for (const path of paths) {
      if (/^licen[cs]e/i.test(path)) {
        return path
      }
    }
    return null
  }

  private readFile(directory: string, filename: string): string {
    return this.fileSystem
      .readFile(this.fileSystem.join(directory, filename))
      .replace(/\r\n/g, '\n')
  }
}
