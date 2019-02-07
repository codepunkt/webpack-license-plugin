import getNpmTarballUrl from 'get-npm-tarball-url'
import LicenseIdentifier from './LicenseIdentifier'
import LicenseTextReader from './LicenseTextReader'
import PackageJsonReader from './PackageJsonReader'
import IAlertAggregator from './types/IAlertAggregator'
import IFileSystem from './types/IFileSystem'
import ILicenseIdentifier from './types/ILicenseIdentifier'
import ILicenseMetaAggregator from './types/ILicenseMetaAggregator'
import ILicenseTextReader from './types/ILicenseTextReader'
import IPackageJson from './types/IPackageJson'
import IPackageJsonReader from './types/IPackageJsonReader'
import IPackageLicenseMeta from './types/IPackageLicenseMeta'
import IPluginOptions from './types/IPluginOptions'

export default class LicenseMetaAggregator implements ILicenseMetaAggregator {
  constructor(
    fileSystem: IFileSystem,
    alertAggregator: IAlertAggregator,
    private licenseIdentifier: ILicenseIdentifier = new LicenseIdentifier(
      alertAggregator
    ),
    private licenseTextReader: ILicenseTextReader = new LicenseTextReader(
      alertAggregator,
      fileSystem
    ),
    private packageJsonReader: IPackageJsonReader = new PackageJsonReader(
      fileSystem
    )
  ) {}

  public aggregateMeta(
    moduleDirs: string[],
    options: IPluginOptions
  ): IPackageLicenseMeta[] {
    return moduleDirs
      .sort((a, b) =>
        this.packageJsonReader
          .readPackageJson(a)
          .name.localeCompare(this.packageJsonReader.readPackageJson(b).name)
      )
      .map(moduleDir => {
        const meta = this.packageJsonReader.readPackageJson(moduleDir)
        const license = this.licenseIdentifier.identifyLicense(meta, options)
        const licenseText = this.licenseTextReader.readLicenseText(
          meta,
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
