import type { Compilation } from 'webpack'
import webpack from 'webpack'
import type IAssetManager from './types/IAssetManager'

const sources = webpack.sources

export default class WebpackAssetManager implements IAssetManager {
  constructor(private compilation: Compilation) {}

  public addFile(filename: string, contents: string): void {
    this.compilation.assets[filename] = new sources.RawSource(contents)
  }
}
