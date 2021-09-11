import * as webpack from 'webpack'
import LicenseFileWriter from './LicenseFileWriter'
import LicenseMetaAggregator from './LicenseMetaAggregator'
import ModuleDirectoryLocator from './ModuleDirectoryLocator'
import OptionsProvider from './OptionsProvider'
import PackageJsonReader from './PackageJsonReader'
import IPluginOptions from './types/IPluginOptions'
import IWebpackPlugin from './types/IWebpackPlugin'
import WebpackAlertAggregator from './WebpackAlertAggregator'
import WebpackAssetManager from './WebpackAssetManager'
import WebpackChunkIterator from './WebpackChunkIterator'
import WebpackFileSystem from './WebpackFileSystem'

const pluginName = 'WebpackLicensePlugin'

/**
 * @todo "emit" vs "compilation" & "optimizeChunkAssets" hooks
 * @todo add banner to chunks? boolean option + banner formatter?
 * @todo override license text or license filename
 * @todo override for version ranges or *
 * @todo select output fields
 * @todo error on missing license text?
 * @todo preferred license types on ambiguity (licenses array or spdx expression)
 */
export default class WebpackLicensePlugin implements IWebpackPlugin {
  private filenames: string[] = []

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
      compilation.hooks.optimizeChunkAssets.tapAsync(
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
    callback: () => void
  ) {
    const alertAggregator = new WebpackAlertAggregator(compilation)
    const optionsProvider = new OptionsProvider(alertAggregator)

    const options = optionsProvider.getOptions(this.pluginOptions)
    alertAggregator.flushAlerts(pluginName)

    const chunkIterator = new WebpackChunkIterator()
    this.filenames = [...this.filenames, ...chunkIterator.iterateChunks(compilation, chunks)]

    if (compilation.compiler?.isChild()) {
      callback?.()
      return
    }

    const fileSystem = new WebpackFileSystem(compiler.inputFileSystem)
    const packageJsonReader = new PackageJsonReader(fileSystem)
    const licenseFileWriter = new LicenseFileWriter(
      new WebpackAssetManager(compilation),
      new ModuleDirectoryLocator(
        fileSystem,
        compiler.options.context,
        packageJsonReader
      ),
      new LicenseMetaAggregator(
        fileSystem,
        alertAggregator,
        options,
        packageJsonReader
      )
    )

    await licenseFileWriter.writeLicenseFiles(this.filenames, options)
    alertAggregator.flushAlerts(pluginName)

    if (callback) {
      callback()
    }
  }
}
