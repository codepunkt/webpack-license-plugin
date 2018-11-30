import getNpmTarballUrl from 'get-npm-tarball-url'
import { compact, uniq } from 'lodash'
import LicenseIdentifier from './LicenseIdentifier'
import LicenseTextReader from './LicenseTextReader'
import ModuleDirectoryLocator from './ModuleDirectoryLocator'
import { IPluginOptions } from './OptionsProvider'
import IAssetManager from './types/IAssetManager'
import IFileSystem from './types/IFileSystem'

export default class LicenseChecker {
  constructor(
    buildRoot: string,
    private fileSystem: IFileSystem,
    private assetManager: IAssetManager,
    private licenseIdentifier: LicenseIdentifier = new LicenseIdentifier(),
    private licenseTextReader: LicenseTextReader = new LicenseTextReader(
      fileSystem
    ),
    private moduleDirectoryLocator: ModuleDirectoryLocator = new ModuleDirectoryLocator(
      fileSystem,
      buildRoot
    )
  ) {}

  public checkLicenses(
    allFilenames: string[],
    options: IPluginOptions,
    handleError: (error: Error) => void
  ): void {
    const moduleDirs = this.getModuleDirs(allFilenames)

    const licenseInfo = moduleDirs.map(moduleDir => {
      // const meta = this.metaReader.readPackageMeta(moduleDir)

      const meta = JSON.parse(
        this.fileSystem.readFile(
          this.fileSystem.join(moduleDir, 'package.json')
        )
      )

      try {
        const license = this.licenseIdentifier.identifyLicense(meta, options)
        const licenseText = this.licenseTextReader.readLicenseText(
          license,
          moduleDir
        )
        return {
          name: meta.name,
          version: meta.version,
          author:
            typeof meta.author === 'object'
              ? `${meta.author.name}${
                  meta.author.email ? ` <${meta.author.email}>` : ''
                }${meta.author.url ? ` (${meta.author.url})` : ''}`
              : meta.author,
          repository:
            meta.repository && meta.repository.url
              ? meta.repository.url
                  .replace('git+ssh://git@', 'git://')
                  .replace('git+https://github.com', 'https://github.com')
                  .replace('git://github.com', 'https://github.com')
                  .replace('git@github.com:', 'https://github.com/')
                  .replace(/\.git$/, '')
              : null,
          source: getNpmTarballUrl(meta.name, meta.version),
          license,
          licenseText,
        }
      } catch (err) {
        handleError(err)
      }
    })

    const licenseInfoString = JSON.stringify(licenseInfo, null, 2)

    this.assetManager.addFile(
      options.outputFilename,
      options.outputTransform(licenseInfoString)
    )

    for (const filename of Object.keys(options.additionalFiles)) {
      this.assetManager.addFile(
        filename,
        options.additionalFiles[filename](licenseInfoString)
      )
    }
  }

  private getModuleDirs(allFilenames: string[]): string[] {
    return uniq(
      compact(
        allFilenames.map(filename =>
          this.moduleDirectoryLocator.getModuleDir(filename)
        )
      )
    )
  }
}
