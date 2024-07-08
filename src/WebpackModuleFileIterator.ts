import type IWebpackChunkModule from './types/IWebpackChunkModule'

export default class WebpackModuleFileIterator {
  public iterateFiles(
    {
      resource,
      rootModule,
      fileDependencies,
      dependencies,
    }: IWebpackChunkModule,
    callback: (filename: string) => void,
  ): void {
    if (resource) {
      callback(resource)
    }
    else if (rootModule?.resource) {
      callback(rootModule.resource)
    }

    if (fileDependencies) {
      fileDependencies.forEach(dep => callback(dep))
    }

    if (dependencies) {
      dependencies.forEach(({ originModule, _parentModule }) => {
        if (originModule?.resource) {
          callback(originModule.resource)
        }
        if (_parentModule?.resource) {
          callback(_parentModule.resource)
        }
      })
    }
  }
}
