import IFileSystem from './types/IFileSystem'
import IPackageJson from './types/IPackageJson'

export default class PackageJsonReader {
  constructor(private fileSystem: IFileSystem) {}

  public readPackageJson(moduleDir: string): IPackageJson {
    const meta = JSON.parse(
      this.fileSystem.readFile(this.fileSystem.join(moduleDir, 'package.json'))
    )

    return meta
  }
}
