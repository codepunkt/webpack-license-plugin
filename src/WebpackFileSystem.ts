import type IFileSystem from './types/IFileSystem'

export default class WebpackFileSystem implements IFileSystem {
  constructor(private fs: any) {}

  public pathExists(filename: string): boolean {
    try {
      this.fs.statSync(filename)
      return true
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      return false
    }
  }

  public readFile(filename: string): string {
    return this.fs.readFileSync(filename).toString('utf8')
  }

  public listPaths(dir: string): string[] {
    return this.fs.readdirSync(dir)
  }
}
