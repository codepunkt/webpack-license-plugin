import * as webpack from 'webpack'
import LicenseFileWriter from '../../src/LicenseFileWriter'
import WebpackChunkIterator from '../../src/WebpackChunkIterator'
import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'

jest.mock('../../src/LicenseFileWriter')
jest.mock('../../src/WebpackChunkIterator')

const MockCompiler = jest.fn<webpack.Compiler & { plugin: any }, any[]>(
  (i) => i
)
const MockCompilation = jest.fn<webpack.Compilation & { plugin: any }, any[]>(
  (i) => i
)
const MockChunk = jest.fn<webpack.Chunk, any[]>((i) => i)

describe('WebpackLicensePlugin', () => {
  beforeEach(() => {
    ;(LicenseFileWriter as jest.Mock).mockReset()
    ;(LicenseFileWriter as jest.Mock).mockImplementation(() => ({
      writeLicenseFiles: jest.fn(),
    }))
    ;(WebpackChunkIterator as jest.Mock).mockReset()
    ;(WebpackChunkIterator as jest.Mock).mockImplementation(() => ({
      iterateChunks: () => [],
    }))
  })

  describe('apply', () => {
    test('taps into compilation and watchRun hooks if hooks are defined', () => {
      const compiler = new MockCompiler({
        hooks: {
          compilation: { tap: jest.fn() },
          watchRun: { tapAsync: jest.fn() },
        },
      })
      const instance = new WebpackLicensePlugin({})
      instance.apply(compiler)

      expect(compiler.hooks.compilation.tap).toHaveBeenCalledTimes(1)
      expect(compiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'webpack-license-plugin',
        expect.any(Function)
      )
      expect(compiler.hooks.watchRun.tapAsync).toHaveBeenCalledTimes(1)
      expect(compiler.hooks.watchRun.tapAsync).toHaveBeenCalledWith(
        'webpack-license-plugin',
        expect.any(Function)
      )
    })

    test('plugs into compilation otherwise', () => {
      const compiler = new MockCompiler({ plugin: jest.fn() })
      const instance = new WebpackLicensePlugin()
      instance.apply(compiler)

      expect(compiler.plugin).toHaveBeenCalledTimes(2)
      expect(compiler.plugin).toHaveBeenCalledWith(
        'compilation',
        expect.any(Function)
      )
      expect(compiler.plugin).toHaveBeenCalledWith(
        'watchRun',
        expect.any(Function)
      )
    })
  })

  describe('handleCompilation', () => {
    test('taps into optimizeChunkAssets hook if hooks are defined', () => {
      const instance = new WebpackLicensePlugin()
      const compilation = new MockCompilation({
        hooks: { optimizeChunkAssets: { tapAsync: jest.fn() } },
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
    const createMockCompilation = (name: string, isChild: boolean) =>
      new MockCompilation({
        assets: [],
        errors: [],
        warnings: [],
        compiler: {
          name,
          isChild: () => isChild,
        },
      })

    test('calls plugin mechanism callback when done', async () => {
      const instance = new WebpackLicensePlugin()
      const callback = jest.fn()

      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        createMockCompilation('mockCompiler', false),
        [new MockChunk()],
        callback
      )

      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('calls writeLicenseFiles with all filenames', async () => {
      ;(WebpackChunkIterator as jest.Mock).mockReset()
      ;(WebpackChunkIterator as jest.Mock)
        .mockImplementationOnce(() => ({
          iterateChunks: () => ['filename1', 'filename2'],
        }))
        .mockImplementationOnce(() => ({
          iterateChunks: () => ['filename1', 'filename3', 'filename4'],
        }))

      const writeLicenseFiles = jest.fn()
      ;(LicenseFileWriter as jest.Mock).mockReset()
      ;(LicenseFileWriter as jest.Mock).mockImplementationOnce(() => ({
        writeLicenseFiles,
      }))

      const instance = new WebpackLicensePlugin()

      const callback1 = jest.fn()
      const mockCompilation1 = createMockCompilation('mockCompiler1', true)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation1,
        [new MockChunk()],
        callback1
      )

      const callback2 = jest.fn()
      const mockCompilation2 = createMockCompilation('mockCompiler2', false)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation2,
        [new MockChunk()],
        callback2
      )

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)

      expect(mockCompilation1.errors).toEqual([])
      expect(mockCompilation2.errors).toEqual([])

      expect(writeLicenseFiles).toHaveBeenCalledWith(
        ['filename1', 'filename2', 'filename3', 'filename4'],
        expect.anything()
      )
      expect(writeLicenseFiles).toHaveBeenCalledTimes(1)
    })

    test('pushes error if handleChunkAssetOptimization is called again after files were written', async () => {
      const instance = new WebpackLicensePlugin()

      const callback1 = jest.fn()
      const mockCompilation1 = createMockCompilation('mockCompiler1', false)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation1,
        [new MockChunk()],
        callback1
      )

      const callback2 = jest.fn()
      const mockCompilation2 = createMockCompilation('mockCompiler2', true)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation2,
        [new MockChunk()],
        callback2
      )

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)

      expect(mockCompilation1.errors).toEqual([])
      expect(mockCompilation2.errors).toEqual([
        new webpack.WebpackError(
          'WebpackLicensePlugin: Found licenses after license files were already created.\nIf you see this message, you ran into an edge case we thought would not happen. Please open an isssue at https://github.com/codepunkt/webpack-license-plugin/issues with details of your webpack configuration so we can invastigate it further.\ncompiler: mockCompiler1, isChild: false\ncompiler: mockCompiler2, isChild: true'
        ),
      ])
    })

    test('reset when handleWatchRun is called', async () => {
      const instance = new WebpackLicensePlugin()

      const callback1 = jest.fn()
      const mockCompilation1 = createMockCompilation('mockCompiler1', false)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation1,
        [new MockChunk()],
        callback1
      )

      const callbackWatchRun = jest.fn()
      await instance.handleWatchRun(undefined, callbackWatchRun)

      const callback2 = jest.fn()
      const mockCompilation2 = createMockCompilation('mockCompiler2', false)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation2,
        [new MockChunk()],
        callback2
      )

      const callback3 = jest.fn()
      const mockCompilation3 = createMockCompilation('mockCompiler3', true)
      await instance.handleChunkAssetOptimization(
        new MockCompiler({ inputFileSystem: 'a', options: { context: 'b' } }),
        mockCompilation3,
        [new MockChunk()],
        callback3
      )

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callbackWatchRun).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(callback3).toHaveBeenCalledTimes(1)

      expect(mockCompilation1.errors).toEqual([])
      expect(mockCompilation2.errors).toEqual([])
      expect(mockCompilation3.errors).toEqual([
        new webpack.WebpackError(
          'WebpackLicensePlugin: Found licenses after license files were already created.\nIf you see this message, you ran into an edge case we thought would not happen. Please open an isssue at https://github.com/codepunkt/webpack-license-plugin/issues with details of your webpack configuration so we can invastigate it further.\ncompiler: mockCompiler2, isChild: false\ncompiler: mockCompiler3, isChild: true'
        ),
      ])
    })
  })
})
