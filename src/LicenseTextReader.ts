import { join } from 'path'
import DefaultLicenseTextProvider from './DefaultLicenseTextProvider'
import IDefaultLicenseTextProvider from './types/IDefaultLicenseTextProvider'
import IFileSystem from './types/IFileSystem'
import IPluginOptions from './types/IPluginOptions'

/**
 * Reads license text from license file.
 *
 * If no license file is found, default license texts can automatically
 * be added (either retrieved from spdx github repository or read from
 * a directory).
 */
export default class LicenseTextReader {
  constructor(
    private fileSystem: IFileSystem,
    private options: Pick<
      IPluginOptions,
      'defaultLicenseTextDir' | 'replenishDefaultLicenseTexts'
    >,
    private defaultLicenseReader: IDefaultLicenseTextProvider = new DefaultLicenseTextProvider(
      options
    )
  ) {}

  public async readLicenseText(
    license: string,
    moduleDir: string
  ): Promise<string | null> {
    if (!license) {
      return null
    }

    if (license && license.indexOf('SEE LICENSE IN ') === 0) {
      const filename = license.split(' ')[3]
      return this.readFile(moduleDir, filename)
    }

    const pathsInModuleDir = this.fileSystem.listPaths(moduleDir)
    const licenseFilename = this.getLicenseFilename(pathsInModuleDir)

    if (licenseFilename !== null) {
      return this.readFile(moduleDir, licenseFilename)
    }

    if (this.options.replenishDefaultLicenseTexts) {
      return await this.getDefaultLicenseText(license)
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

  public async getDefaultLicenseText(license: string): Promise<string> {
    return await this.defaultLicenseReader.retrieveLicenseText(license)
  }
}
