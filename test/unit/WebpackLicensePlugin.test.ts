import type * as webpack from 'webpack'
import LicenseFileWriter from '../../src/LicenseFileWriter'
import WebpackChunkIterator from '../../src/WebpackChunkIterator'
import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'

jest.mock('../../src/LicenseFileWriter')
jest.mock('../../src/WebpackChunkIterator')

const MockCompiler = jest.fn<webpack.Compiler, any[]>((i) => i)
const MockCompilation = jest.fn<webpack.compilation.Compilation, any[]>((i) => i)
const MockChunk = jest.fn<webpack.compilation.Chunk, any[]>((i) => i)

describe('WebpackLicensePlugin', () => {
  beforeEach(() => {
    (LicenseFileWriter as jest.Mock).mockReset();
    (LicenseFileWriter as jest.Mock).mockImplementation(() => ({
      writeLicenseFiles: jest.fn()
    }));
    (WebpackChunkIterator as jest.Mock).mockReset();
    (WebpackChunkIterator as jest.Mock).mockImplementation(() => ({
      iterateChunks: () => []
    }))
  })

  describe('apply', () => {
    test('taps into compilation hook if hooks are defined', () => {
      const compiler = new MockCompiler({
        hooks: { compilation: { tap: jest.fn() } },
      })
      const instance = new WebpackLicensePlugin({})
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
      expect(compiler.plugin).toHaveBeenCalledWith('compilation', expect.any(Function))
    })
  })

  describe('handleCompilation', () => {
    test('taps into optimizeChunkAssets hook if hooks are defined', () => {
      const instance = new WebpackLicensePlugin()
      const compilation = new MockCompilation({
        hooks: { optimizeChunkAssets: { tapAsync: jest.fn() } },
      })
      instance.handleCompilation(new MockCompiler(), compilation)

      expect(compilation.hooks.optimizeChunkAssets.tapAsync).toHaveBeenCalledTimes(1)
      expect(compilation.hooks.optimizeChunkAssets.tapAsync).toHaveBeenCalledWith(
        'webpack-license-plugin',
        expect.any(Function)
      )
    })

    test('plugs into optimize-chunk-assets otherwise', () => {
      const instance = new WebpackLicensePlugin()
      const compilation = new MockCompilation({ plugin: jest.fn() })
      instance.handleCompilation(new MockCompiler(), compilation)

      expect(compilation.plugin).toHaveBeenCalledTimes(1)
      expect(compilation.plugin).toHaveBeenCalledWith('optimize-chunk-assets', expect.any(Function))
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

    test('calls writeLicenseFiles with all filenames', async () => {
      (WebpackChunkIterator as jest.Mock).mockReset();
      (WebpackChunkIterator as jest.Mock)
        .mockImplementationOnce(() => ({
          iterateChunks: () => ['filename1', 'filename2']
        }))
        .mockImplementationOnce(() => ({
          iterateChunks: () => ['filename3', 'filename4']
        }))

      const writeLicenseFiles = jest.fn();
      (LicenseFileWriter as jest.Mock).mockReset();
      (LicenseFileWriter as jest.Mock).mockImplementationOnce(() => ({ writeLicenseFiles }))

      const instance = new WebpackLicensePlugin()
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [], warnings: [], compiler: { isChild: () => true } }),
        [new MockChunk()],
        callback1
      )

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        new MockCompilation({ assets: [], errors: [], warnings: [] }),
        [new MockChunk()],
        callback2
      )

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)

      expect(writeLicenseFiles).toHaveBeenCalledWith(['filename1', 'filename2', 'filename3', 'filename4'], expect.anything())
      expect(writeLicenseFiles).toHaveBeenCalledTimes(1)
    })
  })
})
