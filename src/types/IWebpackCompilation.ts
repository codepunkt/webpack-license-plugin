import { Source } from 'webpack-sources'
import IWebpackChunk from './IWebpackChunk'

export default interface WebpackCompilation {
  chunks: IterableIterator<IWebpackChunk>
  assets: { [key: string]: Source }
  errors: any[]
  warnings: any[]
  hooks: {
    optimizeChunkAssets: {
      tap: (
        pluginName: string,
        handler: (chunks: IterableIterator<IWebpackChunk>) => void
      ) => void
    }
  }
  plugin?: (phase: string, callback: Function) => void
  getPath(
    filename: string,
    data: {
      hash?: any
      chunk?: any
      filename?: string
      basename?: string
      query?: any
    }
  ): string
}
