import type IWebpackChunkModule from './IWebpackChunkModule'

export default interface IWebpackChunk {
  name: string
  modulesIterable?: IterableIterator<IWebpackChunkModule>
  forEachModule?: (callback: (module: IWebpackChunkModule) => void) => void
  modules?: IWebpackChunkModule[]
  entryModule?: IWebpackChunkModule
  files: string[]
}
