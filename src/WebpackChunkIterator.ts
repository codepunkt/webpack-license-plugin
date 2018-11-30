import * as webpack from 'webpack'
import IWebpackChunkIterator from './types/IWebpackChunkIterator'
import WebpackChunkModuleIterator from './WebpackChunkModuleIterator'
import WebpackModuleFileIterator from './WebpackModuleFileIterator'

export default class WebpackChunkIterator implements IWebpackChunkIterator {
  constructor(
    private moduleIterator: WebpackChunkModuleIterator = new WebpackChunkModuleIterator(),
    private fileIterator: WebpackModuleFileIterator = new WebpackModuleFileIterator()
  ) {}

  public iterateChunks(chunks: webpack.compilation.Chunk[]): string[] {
    const filenames = []

    for (const chunk of chunks) {
      this.moduleIterator.iterateModules(chunk, module => {
        this.fileIterator.iterateFiles(module, filename => {
          filenames.push(filename)
        })
      })
    }

    return filenames
  }
}
