import * as webpack from 'webpack'
import PluginOptionsProvider, {
  IWebpackLicensePluginOptions,
} from './PluginOptionsProvider'
import IWebpackChunkIterator from './types/IWebpackChunkIterator'
import IWebpackPlugin from './types/IWebpackPlugin'
import WebpackChunkIterator from './WebpackChunkIterator'
import WebpackFileSystem from './WebpackFileSystem'

export default class WebpackLicensePlugin implements IWebpackPlugin {
  constructor(private pluginOptions: IWebpackLicensePluginOptions = {}) {}

  // @todo "emit" vs "compilation" & "optimizeChunkAssets" hooks
  public apply(compiler: webpack.Compiler) {
    const fileSystem = new WebpackFileSystem(compiler.inputFileSystem)
    const buildRoot = compiler.options.context

    const chunkIterator: IWebpackChunkIterator = new WebpackChunkIterator(
      fileSystem,
      buildRoot
    )

    if (typeof compiler.hooks !== 'undefined') {
      compiler.hooks.compilation.tap(
        'webpack-license-plugin',
        (compilation: webpack.compilation.Compilation) => {
          const optionsProvider: PluginOptionsProvider = new PluginOptionsProvider(
            compilation
          )
          const options = optionsProvider.getOptions(this.pluginOptions)

          compilation.hooks.optimizeChunkAssets.tap(
            'LicenseWebpackPlugin',
            (chunks: webpack.compilation.Chunk[]) => {
              chunkIterator.iterateChunks(compilation, chunks, options)
            }
          )
        }
      )
    } else if (typeof compiler.plugin !== 'undefined') {
      compiler.plugin(
        'compilation',
        (compilation: webpack.compilation.Compilation) => {
          if (typeof compilation.plugin !== 'undefined') {
            const optionsProvider: PluginOptionsProvider = new PluginOptionsProvider(
              compilation
            )
            const options = optionsProvider.getOptions(this.pluginOptions)

            compilation.plugin(
              'optimize-chunk-assets',
              (chunks: webpack.compilation.Chunk[], callback: () => void) => {
                chunkIterator.iterateChunks(compilation, chunks, options)
                callback()
              }
            )
          }
        }
      )
    }
  }
}

export { WebpackLicensePlugin }
