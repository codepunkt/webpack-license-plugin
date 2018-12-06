import getNpmTarballUrl from 'get-npm-tarball-url'
import LicenseIdentifier from './LicenseIdentifier'
import LicenseTextReader from './LicenseTextReader'
import { IPluginOptions } from './OptionsProvider'
import PackageJsonReader from './PackageJsonReader'
import IFileSystem from './types/IFileSystem'
import ILicenseIdentifier from './types/ILicenseIdentifier'
import ILicenseMetaAggregator from './types/ILicenseMetaAggregator'
import ILicenseTextReader from './types/ILicenseTextReader'
import IPackageJson from './types/IPackageJson'
import IPackageJsonReader from './types/IPackageJsonReader'

export default class LicenseMetaAggregator implements ILicenseMetaAggregator {
  constructor(
    fileSystem: IFileSystem,
    private licenseIdentifier: ILicenseIdentifier = new LicenseIdentifier(),
    private licenseTextReader: ILicenseTextReader = new LicenseTextReader(
      fileSystem
    ),
    private packageJsonReader: IPackageJsonReader = new PackageJsonReader(
      fileSystem
    )
  ) {}

  public aggregateMeta(moduleDirs: string[], options: IPluginOptions) {
    return moduleDirs.map(moduleDir => {
      const meta = this.packageJsonReader.readPackageJson(moduleDir)
      const license = this.licenseIdentifier.identifyLicense(meta, options)
      const licenseText = this.licenseTextReader.readLicenseText(
        license,
        moduleDir
      )

      return {
        name: meta.name,
        version: meta.version,
        author: this.getAuthor(meta),
        repository: this.getRepository(meta),
        source: getNpmTarballUrl(meta.name, meta.version),
        license,
        licenseText,
      }
    })
  }

  public getAuthor(meta: Pick<IPackageJson, 'author'>): string {
    return typeof meta.author === 'object'
      ? `${meta.author.name}${
          meta.author.email ? ` <${meta.author.email}>` : ''
        }${meta.author.url ? ` (${meta.author.url})` : ''}`
      : meta.author
  }

  public getRepository(meta: Pick<IPackageJson, 'repository'>): string {
    if (meta.repository && meta.repository.url) {
      return meta.repository.url
        .replace('git+ssh://git@', 'git://')
        .replace('git+https://github.com', 'https://github.com')
        .replace('git://github.com', 'https://github.com')
        .replace('git@github.com:', 'https://github.com/')
        .replace(/\.git$/, '')
    }

    return null
  }
}
