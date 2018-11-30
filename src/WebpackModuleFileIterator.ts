import IWebpackChunkModule from './types/IWebpackChunkModule'

export default class WebpackModuleFileIterator {
  public iterateFiles(
    module: IWebpackChunkModule,
    callback: (filename: string) => void
  ): void {
    if (module.resource) {
      callback(module.resource)
    } else if (module.rootModule && module.rootModule.resource) {
      callback(module.rootModule.resource)
    }

    if (module.fileDependencies) {
      module.fileDependencies.forEach(callback)
    }

    if (module.dependencies) {
      module.dependencies.forEach(dep => {
        if (dep.originModule && dep.originModule.resource) {
          callback(dep.originModule.resource)
        }
      })
    }
  }
}
