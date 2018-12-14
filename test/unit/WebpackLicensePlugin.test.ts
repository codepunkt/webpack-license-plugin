import LicenseFileWriter from '../../src/LicenseFileWriter'
import OptionsProvider from '../../src/OptionsProvider'
import WebpackChunkIterator from '../../src/WebpackChunkIterator'
import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'
import webpack = require('webpack')

const MockCompiler = jest.fn<webpack.Compiler>(i => i)
const MockCompilation = jest.fn<webpack.compilation.Compilation>(i => i)
const MockChunk = jest.fn<webpack.compilation.Chunk>(i => i)
const MockOptionsProvider = jest.fn<OptionsProvider>(i => i)
const MockChunkIterator = jest.fn<WebpackChunkIterator>(i => i)
const MockLicenseFileWriter = jest.fn<LicenseFileWriter>(i => i)

describe('WebpackLicensePlugin', () => {
  describe('apply', () => {
    test('taps into compilation hook if hooks are defined', () => {
      const compiler = new MockCompiler({
        hooks: { compilation: { tap: jest.fn() } },
      })
      const instance = new WebpackLicensePlugin()
      instance.apply(compiler)

      expect(compiler.hooks.compilation.tap).toHaveBeenCalledTimes(1)
      expect(compiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'webpack-license-plugin',
        expect.any(Function)
      )
    })

    test('plugs into compilation otherwise', () => {
      const compiler = new MockCompiler({ plugin: jest.fn() })
      const instance = new WebpackLicensePlugin()
      instance.apply(compiler)

      expect(compiler.plugin).toHaveBeenCalledTimes(1)
      expect(compiler.plugin).toHaveBeenCalledWith(
        'compilation',
        expect.any(Function)
      )
    })
  })

  describe('handleCompilation', () => {
    test('taps into optimizeChunkAssets hook if hooks are defined', () => {
      const instance = new WebpackLicensePlugin()
      const compilation = new MockCompilation({
        hooks: { optimizeChunkAssets: { tap: jest.fn() } },
      })
      instance.handleCompilation(new MockCompiler(), compilation)

      expect(compilation.hooks.optimizeChunkAssets.tap).toHaveBeenCalledTimes(1)
      expect(compilation.hooks.optimizeChunkAssets.tap).toHaveBeenCalledWith(
        'webpack-license-plugin',
        expect.any(Function)
      )
    })

    test('plugs into optimize-chunk-assets otherwise', () => {
      const instance = new WebpackLicensePlugin()
      const compilation = new MockCompilation({ plugin: jest.fn() })
      instance.handleCompilation(new MockCompiler(), compilation)

      expect(compilation.plugin).toHaveBeenCalledTimes(1)
      expect(compilation.plugin).toHaveBeenCalledWith(
        'optimize-chunk-assets',
        expect.any(Function)
      )
    })
  })

  describe('handleChunkAssetOptimization', () => {
    test('calls callback for plugin mechanism', async () => {
      const instance = new WebpackLicensePlugin()
      const callback = jest.fn()

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [] }),
        [new MockChunk()],
        callback
      )

      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('gets plugin options', async () => {
      const options = { outputFilename: 'oss-bom.json' }
      const instance = new WebpackLicensePlugin(options)
      const optionsProvider = new MockOptionsProvider({
        getOptions: jest.fn(),
      })

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [] }),
        [new MockChunk()],
        null,
        optionsProvider
      )

      expect(optionsProvider.getOptions).toHaveBeenCalledTimes(1)
      expect(optionsProvider.getOptions).toHaveBeenCalledWith(
        options,
        expect.any(Function)
      )
    })

    test('iterates through chunks to retrieve filenames', async () => {
      const instance = new WebpackLicensePlugin()
      const chunkIterator = new MockChunkIterator({ iterateChunks: jest.fn() })
      const chunks = [new MockChunk()]

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [] }),
        chunks,
        null,
        new MockOptionsProvider({ getOptions: jest.fn() }),
        chunkIterator
      )

      expect(chunkIterator.iterateChunks).toHaveBeenCalledTimes(1)
      expect(chunkIterator.iterateChunks).toHaveBeenCalledWith(chunks)
    })

    test('calls licenseFileWriter with filenames', async () => {
      const instance = new WebpackLicensePlugin()
      const licenseFileWriter = new MockLicenseFileWriter({
        writeLicenseFiles: jest.fn(),
      })
      const filenames = ['index.js', 'node_modules/module/index.js']
      const options = { outputFilename: 'bom.json' }

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [] }),
        [new MockChunk()],
        null,
        new MockOptionsProvider({
          getOptions: jest.fn().mockImplementation(() => options),
        }),
        new MockChunkIterator({
          iterateChunks: jest.fn().mockImplementation(() => filenames),
        }),
        null,
        licenseFileWriter
      )

      expect(licenseFileWriter.writeLicenseFiles).toHaveBeenCalledTimes(1)
      expect(licenseFileWriter.writeLicenseFiles).toHaveBeenCalledWith(
        filenames,
        options,
        expect.any(Function)
      )
    })
  })
})
