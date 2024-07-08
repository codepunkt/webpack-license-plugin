import { join } from 'node:path'
import DefaultLicenseTextProvider from './DefaultLicenseTextProvider'
import type IAlertAggregator from './types/IAlertAggregator'
import type IDefaultLicenseTextProvider from './types/IDefaultLicenseTextProvider'
import type IFileSystem from './types/IFileSystem'
import type IPackageJson from './types/IPackageJson'
import type IPluginOptions from './types/IPluginOptions'

/**
 * Reads license text from license file.
 *
 * If no license file is found, default license texts can automatically
 * be added (either retrieved from spdx github repository or read from
 * a directory).
 */
export default class LicenseTextReader {
  constructor(
    private alertAggregator: IAlertAggregator,
    private fileSystem: IFileSystem,
    private options: Pick<IPluginOptions, 'replenishDefaultLicenseTexts'>,
    private defaultLicenseReader: IDefaultLicenseTextProvider = new DefaultLicenseTextProvider(),
  ) {}

  public async readLicenseText(
    meta: IPackageJson,
    license: string,
    moduleDir: string,
  ): Promise<string | null> {
    const id = `${meta.name}@${meta.version}`

    if (!license) {
      return null
    }

    if (license.indexOf('SEE LICENSE IN ') === 0) {
      const filename = license.split(' ')[3]
      try {
        return this.readFile(moduleDir, filename)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        this.alertAggregator.addError(
          `could not find file specified in package.json license field of ${id}`,
        )
      }
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
