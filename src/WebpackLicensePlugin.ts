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

interface ObservedCompiler {
  name: string
  isChild: boolean
}

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
  private readonly filenames = new Set<string>()
  private createdFiles = false
  private observedCompilers: ObservedCompiler[] = []

  constructor(private pluginOptions: Partial<IPluginOptions> = {}) {}

  public apply(compiler: webpack.Compiler) {
    if (typeof compiler.hooks !== 'undefined') {
      compiler.hooks.compilation.tap(
        'webpack-license-plugin',
        this.handleCompilation.bind(this, compiler)
      )
      compiler.hooks.watchRun.tapAsync(
        'webpack-license-plugin',
        this.handleWatchRun.bind(this)
      )
      // @ts-ignore
    } else if (typeof compiler.plugin !== 'undefined') {
      // @ts-ignore
      compiler.plugin(
        'compilation',
        this.handleCompilation.bind(this, compiler)
      )
      // @ts-ignore
      compiler.plugin('watchRun', this.handleWatchRun.bind(this))
    }
  }

  public async handleWatchRun(_: unknown, callback: () => void) {
    this.createdFiles = false
    this.observedCompilers = []
    callback()
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
      // @ts-ignore
    } else if (typeof compilation.plugin !== 'undefined') {
      // @ts-ignore
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
    this.observedCompilers.push({
      name: compilation.compiler.name,
      isChild: compilation.compiler.isChild(),
    })

    if (this.createdFiles) {
      const observedCompilersMessage = this.observedCompilers
        .map(({ name, isChild }) => `compiler: ${name}, isChild: ${isChild}`)
        .join('\n')
      const errorMessage = `${pluginName}: Found licenses after license files were already created.\nIf you see this message, you ran into an edge case we thought would not happen. Please open an isssue at https://github.com/codepunkt/webpack-license-plugin/issues with details of your webpack configuration so we can invastigate it further.\n${observedCompilersMessage}`
      compilation.errors.push(errorMessage)
      callback()
      return
    }

    if (!compilation.compiler.isChild()) {
      this.createdFiles = true
    }

    const alertAggregator = new WebpackAlertAggregator(compilation)
    const optionsProvider = new OptionsProvider(alertAggregator)

    const options = optionsProvider.getOptions(this.pluginOptions)
    alertAggregator.flushAlerts(pluginName)

    const chunkIterator = new WebpackChunkIterator()
    for (const filename of chunkIterator.iterateChunks(compilation, chunks)) {
      this.filenames.add(filename)
    }

    if (compilation.compiler.isChild()) {
      callback()
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

    await licenseFileWriter.writeLicenseFiles([...this.filenames], options)
    alertAggregator.flushAlerts(pluginName)

    callback()
  }
}
