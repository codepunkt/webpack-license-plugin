import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'
import webpack = require('webpack')

const MockCompiler = jest.fn<webpack.Compiler, any[]>((i) => i)
const MockCompilation = jest.fn<webpack.compilation.Compilation, any[]>(
  (i) => i
)
const MockChunk = jest.fn<webpack.compilation.Chunk, any[]>((i) => i)

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
        hooks: { optimizeChunkAssets: { tap: jest.fn(), tapAsync: jest.fn() } },
      })
      instance.handleCompilation(new MockCompiler(), compilation)

      expect(
        compilation.hooks.optimizeChunkAssets.tapAsync
      ).toHaveBeenCalledTimes(1)
      expect(
        compilation.hooks.optimizeChunkAssets.tapAsync
      ).toHaveBeenCalledWith('webpack-license-plugin', expect.any(Function))
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
    test('calls plugin mechanism callback when done', async () => {
      const instance = new WebpackLicensePlugin()
      const callback = jest.fn()

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [], warnings: [] }),
        [new MockChunk()],
        callback
      )

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
