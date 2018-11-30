import { join, resolve } from 'path'

export default class WebpackFileSystem {
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

  public resolve(pathInput: string): string {
    return resolve(pathInput)
  }

  public listPaths(dir: string): string[] {
    return this.fs.readdirSync(dir)
  }
}
