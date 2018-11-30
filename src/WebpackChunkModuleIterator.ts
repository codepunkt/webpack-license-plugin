import * as webpack from 'webpack'
import IWebpackChunkModule from './types/IWebpackChunkModule'

type Chunk = webpack.compilation.Chunk & {
  forEachModule?: (callback: (module: IWebpackChunkModule) => void) => void
  modules?: IWebpackChunkModule[]
}

export default class WebpackChunkModuleIterator {
  public iterateModules(
    chunk: Chunk,
    callback: (module: IWebpackChunkModule) => void
  ): void {
    if (typeof chunk.modulesIterable !== 'undefined') {
      for (const module of chunk.modulesIterable) {
        callback(module)
      }
      // } else if (typeof chunk.getModules === 'function') {
      //   chunk.getModules().forEach(callback)
    } else if (typeof chunk.forEachModule === 'function') {
      chunk.forEachModule(callback)
    } else if (Array.isArray(chunk.modules)) {
      chunk.modules.forEach(callback)
    }

    if (chunk.entryModule) {
      callback(chunk.entryModule)
    }
  }
}
