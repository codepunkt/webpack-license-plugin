import webpack = require('webpack')
import IAssetManager from './types/IAssetManager'

export default class WebpackAssetManager implements IAssetManager {
  constructor(private compilation: webpack.compilation.Compilation) {}

  public addFile(filename: string, contents: string): void {
    this.compilation.assets[filename] = {
      source: () => contents,
      size: () => contents.length,
    }
  }
}
