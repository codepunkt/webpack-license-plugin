import LicenseIdentifier from './LicenseIdentifier'
import LicenseTextReader from './LicenseTextReader'
import NoticeTextReader from './NoticeTextReader'
import type IAlertAggregator from './types/IAlertAggregator'
import type IFileSystem from './types/IFileSystem'
import type ILicenseIdentifier from './types/ILicenseIdentifier'
import type ILicenseMetaAggregator from './types/ILicenseMetaAggregator'
import type ILicenseTextReader from './types/ILicenseTextReader'
import type INoticeTextReader from './types/INoticeTextReader'
import type IPackageJson from './types/IPackageJson'
import type IPackageJsonReader from './types/IPackageJsonReader'
import type IPackageLicenseMeta from './types/IPackageLicenseMeta'
import type IPluginOptions from './types/IPluginOptions'

export default class LicenseMetaAggregator implements ILicenseMetaAggregator {
  constructor(
    fileSystem: IFileSystem,
    alertAggregator: IAlertAggregator,
    private options: IPluginOptions,
    private packageJsonReader: IPackageJsonReader,
    private licenseIdentifier: ILicenseIdentifier = new LicenseIdentifier(
      alertAggregator,
    ),
    private licenseTextReader: ILicenseTextReader = new LicenseTextReader(
      alertAggregator,
      fileSystem,
      options,
    ),
    private noticeTextReader: INoticeTextReader = new NoticeTextReader(
      fileSystem,
    ),
  ) { }

  private getNpmTarballUrl(
    pkgName: string,
    pkgVersion: string,
  ) {
    const scopelessName = pkgName[0] !== '@' ? pkgName : pkgName.split('/')[1]
    const plusPos = pkgVersion.indexOf('+')
    const version = plusPos === -1 ? pkgVersion : pkgVersion.substring(0, plusPos)
    return `https://registry.npmjs.org/${pkgName}/-/${scopelessName}-${version}.tgz`
  }

  public async aggregateMeta(
    moduleDirs: string[],
  ): Promise<IPackageLicenseMeta[]> {
    const packageSet = new Set()
    const result: IPackageLicenseMeta[] = []
    const sortedModuleDirs = moduleDirs.sort((a, b) =>
      this.packageJsonReader
        .readPackageJson(a)
        .name.localeCompare(this.packageJsonReader.readPackageJson(b).name),
    )

    for (const moduleDir of sortedModuleDirs) {
      const meta = this.packageJsonReader.readPackageJson(moduleDir)
      const packageIdentifier = `${meta.name}@${meta.version}`

      if (packageSet.has(packageIdentifier)) {
        continue
      }

      if (this.options.excludedPackageTest(meta.name, meta.version)) {
        continue
      }

      packageSet.add(packageIdentifier)
      const license = this.licenseIdentifier.identifyLicense(meta, this.options)
      const licenseText = await this.licenseTextReader.readLicenseText(
        meta,
        license,
        moduleDir,
      )
      const noticeText = this.options.includeNoticeText ? await this.noticeTextReader.readNoticeText(moduleDir) : undefined
      result.push({
        name: meta.name,
        version: meta.version,
        author: this.getAuthor(meta),
        repository: this.getRepository(meta),
        source: this.getNpmTarballUrl(meta.name, meta.version),
        license,
        licenseText,
        ...(noticeText ? { noticeText } : {}),
      })
    }

    return result
  }

  public getAuthor(meta: Pick<IPackageJson, 'author'>): string {
    return typeof meta.author === 'object'
      ? `${meta.author.name}${meta.author.email ? ` <${meta.author.email}>` : ''
      }${meta.author.url ? ` (${meta.author.url})` : ''}`
      : meta.author
  }

  public getRepository(meta: Pick<IPackageJson, 'repository'>): string {
    if (meta.repository && meta.repository.url) {
      return meta.repository.url
    }
    else if (typeof meta.repository === 'string') {
      return meta.repository
    }

    return null
  }
}
