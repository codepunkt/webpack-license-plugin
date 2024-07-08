import lodash from 'lodash'
import type IAssetManager from './types/IAssetManager'
import type ILicenseMetaAggregator from './types/ILicenseMetaAggregator'
import type IModuleDirectoryLocator from './types/IModuleDirectoryLocator'
import type IPluginOptions from './types/IPluginOptions'

const { compact, uniq } = lodash

export default class LicenseFileWriter {
  constructor(
    private assetManager: IAssetManager,
    private moduleDirectoryLocator: IModuleDirectoryLocator,
    private licenseMetaAggregator: ILicenseMetaAggregator,
  ) {}

  public async writeLicenseFiles(
    filenames: string[],
    options: IPluginOptions,
  ): Promise<void> {
    const moduleDirs = this.getModuleDirs(filenames)
    const includePackages = await options.includePackages()
    const licenseMeta = await this.licenseMetaAggregator.aggregateMeta([
      ...new Set([...moduleDirs, ...includePackages]),
    ])

    const fileContents = JSON.stringify(licenseMeta, null, 2)
    this.assetManager.addFile(options.outputFilename, fileContents)

    for (const filename of Object.keys(options.additionalFiles)) {
      const result = await options.additionalFiles[filename](licenseMeta)
      this.assetManager.addFile(filename, result)
    }
  }

  public getModuleDirs(filenames: string[]): string[] {
    return uniq(
      compact(
        filenames.map((filename) => {
          return this.moduleDirectoryLocator.getModuleDir(filename)
        }),
      ),
    )
  }
}
