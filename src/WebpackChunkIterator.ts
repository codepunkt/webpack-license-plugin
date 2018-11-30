import getNpmTarballUrl from 'get-npm-tarball-url'
import { compact, uniq } from 'lodash'
import * as webpack from 'webpack'
import LicenseIdentifier from './LicenseIdentifier'
import LicenseTextReader from './LicenseTextReader'
import ModuleDirectoryLocator from './ModuleDirectoryLocator'
import { IWebpackLicensePluginOptions } from './PluginOptionsProvider'
import IWebpackChunkIterator from './types/IWebpackChunkIterator'
import WebpackChunkModuleIterator from './WebpackChunkModuleIterator'
import WebpackFileSystem from './WebpackFileSystem'
import WebpackModuleFileIterator from './WebpackModuleFileIterator'

export default class WebpackChunkIterator implements IWebpackChunkIterator {
  constructor(
    private fileSystem: WebpackFileSystem,
    buildRoot: string,
    private moduleIterator: WebpackChunkModuleIterator = new WebpackChunkModuleIterator(),
    private fileIterator: WebpackModuleFileIterator = new WebpackModuleFileIterator(),
    private moduleDirectoryLocator: ModuleDirectoryLocator = new ModuleDirectoryLocator(
      fileSystem,
      buildRoot
    ),
    private licenseIdentifier: LicenseIdentifier = new LicenseIdentifier([]),
    private licenseTextReader: LicenseTextReader = new LicenseTextReader(
      fileSystem
    )
  ) {}

  public iterateChunks(
    compilation: webpack.compilation.Compilation,
    chunks: webpack.compilation.Chunk[],
    options: IWebpackLicensePluginOptions
  ): void {
    const moduleDirs = []

    for (const chunk of chunks) {
      this.moduleIterator.iterateModules(chunk, module => {
        this.fileIterator.iterateFiles(module, filename => {
          moduleDirs.push(this.moduleDirectoryLocator.getModuleDir(filename))
        })
      })
    }
    const licenseInfo = uniq(compact(moduleDirs)).map(moduleDir => {
      const packageJson = JSON.parse(
        this.fileSystem.readFile(
          this.fileSystem.join(moduleDir, 'package.json')
        )
      )

      const license = this.licenseIdentifier.identifyLicense(
        packageJson,
        options
      )

      if (options.unacceptableLicenseTest(license)) {
        const packageIdentifier = `${packageJson.name}@${packageJson.version}`
        compilation.errors.push(
          new Error(
            `WebpackLicensePlugin: found unacceptable license "${license}" for ${packageIdentifier}`
          )
        )
      }

      const licenseText = this.licenseTextReader.readLicenseText(
        license,
        moduleDir
      )

      return {
        name: packageJson.name,
        version: packageJson.version,
        author:
          typeof packageJson.author === 'object'
            ? `${packageJson.author.name}${
                packageJson.author.email ? ` <${packageJson.author.email}>` : ''
              }${packageJson.author.url ? ` (${packageJson.author.url})` : ''}`
            : packageJson.author,
        repository:
          packageJson.repository && packageJson.repository.url
            ? packageJson.repository.url
                .replace('git+ssh://git@', 'git://')
                .replace('git+https://github.com', 'https://github.com')
                .replace('git://github.com', 'https://github.com')
                .replace('git@github.com:', 'https://github.com/')
                .replace(/\.git$/, '')
            : null,
        source: getNpmTarballUrl(packageJson.name, packageJson.version),
        license,
        licenseText,
      }
    })

    const licenseInfoString = JSON.stringify(licenseInfo, null, 2)

    const addFile = (filename: string, contents: string): void => {
      compilation.assets[filename] = {
        source: () => contents,
        size: () => contents.length,
      }
    }

    addFile(options.outputFilename, options.outputTransform(licenseInfoString))

    for (const filename of Object.keys(options.additionalFiles)) {
      addFile(filename, options.additionalFiles[filename](licenseInfoString))
    }
  }
}
