import * as webpack from 'webpack'

export default interface IWebpackChunkIterator {
  iterateChunks(chunks: webpack.compilation.Chunk[]): string[]
}
