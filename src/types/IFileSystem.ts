export default interface IFileSystem {
  listPaths: (dir: string) => string[]
  pathExists: (filename: string) => boolean
  readFile: (filename: string) => string
}
