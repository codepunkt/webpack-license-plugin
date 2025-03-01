import type { Compilation } from 'webpack'
import type IAssetManager from './types/IAssetManager'
import webpack from 'webpack'

const sources = webpack.sources

export default class WebpackAssetManager implements IAssetManager {
  constructor(private compilation: Compilation) {}

  public addFile(filename: string, contents: string): void {
    this.compilation.assets[filename] = new sources.RawSource(contents)
  }
}
