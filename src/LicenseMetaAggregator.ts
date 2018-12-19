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
    private options: IPluginOptions,
    private licenseIdentifier: ILicenseIdentifier = new LicenseIdentifier(
      alertAggregator
    ),
    private licenseTextReader: ILicenseTextReader = new LicenseTextReader(
      fileSystem,
      options
    ),
    private packageJsonReader: IPackageJsonReader = new PackageJsonReader(
      fileSystem
    )
  ) {}

  // @todo skip excluded packages, when option `excludedPackageTest` is set
  public async aggregateMeta(
    moduleDirs: string[]
  ): Promise<IPackageLicenseMeta[]> {
    const result: IPackageLicenseMeta[] = []
    const sortedModuleDirs = moduleDirs.sort((a, b) =>
      this.packageJsonReader
        .readPackageJson(a)
        .name.localeCompare(this.packageJsonReader.readPackageJson(b).name)
    )

    // @todo parallel with Promise.all
    for (const moduleDir of sortedModuleDirs) {
      const meta = this.packageJsonReader.readPackageJson(moduleDir)
      const license = this.licenseIdentifier.identifyLicense(meta, this.options)
      const licenseText = await this.licenseTextReader.readLicenseText(
        license,
        moduleDir
      )

      result.push({
        name: meta.name,
        version: meta.version,
        author: this.getAuthor(meta),
        repository: this.getRepository(meta),
        source: getNpmTarballUrl(meta.name, meta.version),
        license,
        licenseText,
      })
    }

    return result
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
