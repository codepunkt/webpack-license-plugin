import * as webpack from 'webpack'
import WebpackChunkModuleIterator, {
  Compilation,
} from './WebpackChunkModuleIterator'
import WebpackModuleFileIterator from './WebpackModuleFileIterator'

export default class WebpackChunkIterator {
  constructor(
    private moduleIterator: WebpackChunkModuleIterator = new WebpackChunkModuleIterator(),
    private fileIterator: WebpackModuleFileIterator = new WebpackModuleFileIterator()
  ) {}

  public iterateChunks(
    compilation: webpack.Compilation,
    chunks: webpack.Chunk[]
  ): string[] {
    const filenames = []

    for (const chunk of chunks) {
      this.moduleIterator.iterateModules(
        compilation as Compilation,
        chunk,
        (module) => {
          this.fileIterator.iterateFiles(module, (filename) => {
            filenames.push(filename)
          })
        }
      )
    }

    return filenames
  }
}
