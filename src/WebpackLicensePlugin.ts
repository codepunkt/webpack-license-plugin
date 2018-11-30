import * as webpack from 'webpack'
import LicenseChecker from './LicenseChecker'
import OptionsProvider, { IPluginOptions } from './OptionsProvider'
import IWebpackChunkIterator from './types/IWebpackChunkIterator'
import IWebpackPlugin from './types/IWebpackPlugin'
import WebpackAssetManager from './WebpackAssetManager'
import WebpackChunkIterator from './WebpackChunkIterator'
import WebpackFileSystem from './WebpackFileSystem'

/**
 * @todo "emit" vs "compilation" & "optimizeChunkAssets" hooks
 */
export default class WebpackLicensePlugin implements IWebpackPlugin {
  constructor(private pluginOptions: Partial<IPluginOptions> = {}) {}

  public apply(compiler: webpack.Compiler) {
    if (typeof compiler.hooks !== 'undefined') {
      compiler.hooks.compilation.tap(
        'webpack-license-plugin',
        this.handleCompilation.bind(this, compiler)
      )
    } else if (typeof compiler.plugin !== 'undefined') {
      compiler.plugin(
        'compilation',
        this.handleCompilation.bind(this, compiler)
      )
    }
  }

  private handleCompilation(
    compiler: webpack.Compiler,
    compilation: webpack.compilation.Compilation
  ) {
    if (typeof compilation.hooks !== 'undefined') {
      compilation.hooks.optimizeChunkAssets.tap(
        'LicenseWebpackPlugin',
        this.handleChunkAssetOptimization.bind(this, compiler, compilation)
      )
    } else if (typeof compilation.plugin !== 'undefined') {
      compilation.plugin(
        'optimize-chunk-assets',
        this.handleChunkAssetOptimization.bind(this, compiler, compilation)
      )
    }
  }

  private handleChunkAssetOptimization(
    compiler: webpack.Compiler,
    compilation: webpack.compilation.Compilation,
    chunks: webpack.compilation.Chunk[],
    callback: () => void
  ) {
    const buildRoot = compiler.options.context
    const handleError = err => {
      compilation.errors.push(err)
    }

    const fileSystem = new WebpackFileSystem(compiler.inputFileSystem)
    const chunkIterator: IWebpackChunkIterator = new WebpackChunkIterator()
    const optionsProvider: OptionsProvider = new OptionsProvider(handleError)
    const options = optionsProvider.getOptions(this.pluginOptions)
    const assetManager = new WebpackAssetManager(compilation)
    const allFilenames = chunkIterator.iterateChunks(chunks)

    const licenseChecker = new LicenseChecker(
      buildRoot,
      fileSystem,
      assetManager
    )
    licenseChecker.checkLicenses(allFilenames, options, handleError)

    if (callback) {
      callback()
    }
  }
}
