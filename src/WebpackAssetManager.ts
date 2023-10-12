import type { Compilation } from 'webpack'
import { sources } from 'webpack'
import type IAssetManager from './types/IAssetManager'

export default class WebpackAssetManager implements IAssetManager {
  constructor(private compilation: Compilation) {}

  public addFile(filename: string, contents: string): void {
    this.compilation.assets[filename] = new sources.RawSource(contents)
  }
}
