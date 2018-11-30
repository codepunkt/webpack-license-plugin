import { join, resolve } from 'path'
import IFileSystem from './types/IFileSystem'

export default class WebpackFileSystem implements IFileSystem {
  constructor(private fs: any) {}

  public isFileInDirectory(filename: string, directory: string): boolean {
    const normalizedFile = this.resolve(filename)
    const normalizedDirectory = this.resolve(directory)
    return normalizedFile.indexOf(normalizedDirectory) === 0
  }

  public pathExists(filename: string): boolean {
    try {
      this.fs.statSync(filename)
      return true
    } catch (e) {
      return false
    }
  }

  public readFile(filename: string): string {
    return this.fs.readFileSync(filename).toString('utf8')
  }

  public join(...paths: string[]): string {
    return join(...paths)
  }

  public resolve(path: string): string {
    return resolve(path)
  }

  public listPaths(dir: string): string[] {
    return this.fs.readdirSync(dir)
  }
}
