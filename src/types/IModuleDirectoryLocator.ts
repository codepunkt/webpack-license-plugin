export default interface IModuleDirectoryLocator {
  getModuleDir: (filename: string) => string | null
}
