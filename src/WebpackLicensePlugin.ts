import * as webpack from 'webpack'
import LicenseFileWriter from './LicenseFileWriter'
import LicenseMetaAggregator from './LicenseMetaAggregator'
import ModuleDirectoryLocator from './ModuleDirectoryLocator'
import OptionsProvider, { IPluginOptions } from './OptionsProvider'
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

  public handleCompilation(
    compiler: webpack.Compiler,
    compilation: webpack.compilation.Compilation
  ) {
    if (typeof compilation.hooks !== 'undefined') {
      compilation.hooks.optimizeChunkAssets.tap(
        'webpack-license-plugin',
        this.handleChunkAssetOptimization.bind(this, compiler, compilation)
      )
    } else if (typeof compilation.plugin !== 'undefined') {
      compilation.plugin(
        'optimize-chunk-assets',
        this.handleChunkAssetOptimization.bind(this, compiler, compilation)
      )
    }
  }

  public async handleChunkAssetOptimization(
    compiler: webpack.Compiler,
    compilation: webpack.compilation.Compilation,
    chunks: webpack.compilation.Chunk[],
    callback: () => void,
    optionsProvider: OptionsProvider = new OptionsProvider(),
    chunkIterator: WebpackChunkIterator = new WebpackChunkIterator(),
    fileSystem: WebpackFileSystem = new WebpackFileSystem(
      compiler.inputFileSystem
    ),
    licenseFileWriter: LicenseFileWriter = new LicenseFileWriter(
      new WebpackAssetManager(compilation),
      new ModuleDirectoryLocator(fileSystem, compiler.options.context),
      new LicenseMetaAggregator(fileSystem)
    )
  ) {
    const handleError = err => {
      compilation.errors.push(err)
    }

    // get options
    const options = optionsProvider.getOptions(this.pluginOptions, handleError)

    // retrieve filenames
    const filenames = chunkIterator.iterateChunks(chunks)

    // write license meta files
    await licenseFileWriter.writeLicenseFiles(filenames, options, handleError)

    if (callback) {
      callback()
    }
  }
}
