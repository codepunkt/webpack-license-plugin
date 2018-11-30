export default interface IFileSystem {
  join(...paths: string[]): string
  listPaths(dir: string): string[]
  pathExists(filename: string): boolean
  readFile(filename: string): string
  resolve(path: string): string
}
