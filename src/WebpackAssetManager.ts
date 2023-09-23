import webpack from 'webpack'
import type IAssetManager from './types/IAssetManager'

export default class WebpackAssetManager implements IAssetManager {
  constructor(private compilation: webpack.Compilation) {}

  public addFile(filename: string, contents: string): void {
    this.compilation.assets[filename] = new webpack.sources.RawSource(contents)
  }
}
