import { compact, uniq } from 'lodash'
import IAssetManager from './types/IAssetManager'
import ILicenseMetaAggregator from './types/ILicenseMetaAggregator'
import IModuleDirectoryLocator from './types/IModuleDirectoryLocator'
import IPluginOptions from './types/IPluginOptions'

export default class LicenseFileWriter {
  constructor(
    public assetManager: IAssetManager,
    private moduleDirectoryLocator: IModuleDirectoryLocator,
    private licenseMetaAggregator: ILicenseMetaAggregator
  ) {}

  public async writeLicenseFiles(
    filenames: string[],
    options: IPluginOptions,
    handleError: (error: Error) => void
  ): Promise<void> {
    try {
      const moduleDirs = this.getModuleDirs(filenames)
      const licenseMeta = this.licenseMetaAggregator.aggregateMeta(
        moduleDirs,
        options
      )

      const licenseMetaString = JSON.stringify(licenseMeta, null, 2)
      this.assetManager.addFile(options.outputFilename, licenseMetaString)

      for (const filename of Object.keys(options.additionalFiles)) {
        const result = await options.additionalFiles[filename](licenseMeta)
        this.assetManager.addFile(filename, result)
      }
    } catch (err) {
      handleError(err)
    }
  }

  public getModuleDirs(filenames: string[]): string[] {
    return uniq(
      compact(
        filenames.map(filename =>
          this.moduleDirectoryLocator.getModuleDir(filename)
        )
      )
    )
  }
}
