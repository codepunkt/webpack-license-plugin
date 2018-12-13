import IFileSystem from './types/IFileSystem'
import webpack = require('webpack')

// readFileSync(path: string): Buffer;
// readlink(path: string, callback: (err: Error | undefined | null, linkString: string) => void): void;
// readlinkSync(path: string): string;
// statSync(path: string): any;

export default class WebpackFileSystem implements IFileSystem {
  constructor(private fs: any) {}

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

  public listPaths(dir: string): string[] {
    return this.fs.readdirSync(dir)
  }
}
