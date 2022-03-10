import * as webpack from 'webpack'
import IWebpackChunkModule from './types/IWebpackChunkModule'

type Compilation = Partial<
  webpack.compilation.Compilation & {
    chunkGraph: {
      getChunkModulesIterable: (chunk: Chunk) => IWebpackChunkModule[]
      getChunkEntryModulesIterable: (chunk: Chunk) => IWebpackChunkModule[]
    }
  }
>

type Chunk = Partial<
  Pick<
    webpack.compilation.Chunk & {
      forEachModule?: (callback: (module: IWebpackChunkModule) => void) => void
      modules?: IWebpackChunkModule[]
    },
    'entryModule' | 'forEachModule' | 'modules' | 'modulesIterable'
  >
>

export default class WebpackChunkModuleIterator {
  public iterateModules(
    compilation: Compilation,
    chunk: Chunk,
    callback: (module: IWebpackChunkModule) => void
  ): void {
    if (typeof compilation.chunkGraph !== 'undefined') {
      for (const module of compilation.chunkGraph.getChunkModulesIterable(
        chunk
      )) {
        callback(module)
      }
    } else if (typeof chunk.modulesIterable !== 'undefined') {
      for (const module of chunk.modulesIterable) {
        // @ts-ignore
        callback(module)
      }
      // } else if (typeof chunk.getModules === 'function') {
      //   chunk.getModules().forEach(callback)
    } else if (typeof chunk.forEachModule === 'function') {
      chunk.forEachModule(callback)
    } else if (Array.isArray(chunk.modules)) {
      chunk.modules.forEach((module) => callback(module))
    }

    if (typeof compilation.chunkGraph !== 'undefined') {
      for (const module of compilation.chunkGraph.getChunkEntryModulesIterable(
        chunk
      )) {
        callback(module)
      }
    } else if (chunk.entryModule) {
      // @ts-ignore
      callback(chunk.entryModule)
    }
  }
}
