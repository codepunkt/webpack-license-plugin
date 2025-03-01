import type IAssetManager from '../../src/types/IAssetManager'
import type ILicenseMetaAggregator from '../../src/types/ILicenseMetaAggregator'
import type IModuleDirectoryLocator from '../../src/types/IModuleDirectoryLocator'
import defaultOptions from '../../src/defaultOptions'
import LicenseFileWriter from '../../src/LicenseFileWriter'

const AssetManager = jest.fn<IAssetManager, any[]>(() => ({
  addFile: jest.fn(),
}))
const DirectoryLocator = jest.fn<IModuleDirectoryLocator, any[]>(impl => ({
  getModuleDir: jest.fn(impl),
}))
const MetaAggregator = jest.fn<ILicenseMetaAggregator, any[]>(impl => ({
  aggregateMeta: jest.fn(impl),
}))

describe('licenseFileWriter', () => {
  describe('getModuleDirs', () => {
    it('returns module dirs', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => undefined),
      )

      expect(instance.getModuleDirs(['index.js'])).toEqual(['dir-index.js'])
    })

    it('only returns unique module dirs', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => undefined),
      )

      expect(instance.getModuleDirs(['index.js', 'index.js'])).toEqual([
        'dir-index.js',
      ])
    })

    it('returns module dirs without null values', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => (d === 'a.js' ? 'module' : null)),
        new MetaAggregator(() => undefined),
      )

      expect(instance.getModuleDirs(['a.js', 'b.js'])).toEqual(['module'])
    })
  })

  describe('writeLicenseFiles', () => {
    it('adds meta file to the output', async () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' })),
      )

      await instance.writeLicenseFiles([], defaultOptions)

      expect(assetManager.addFile).toHaveBeenCalledTimes(1)
      expect(assetManager.addFile).toHaveBeenCalledWith(
        defaultOptions.outputFilename,
        '{\n  "foo": "bar"\n}',
      )
    })

    it('adds a different file when options.outputFilename is set', async () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' })),
      )

      await instance.writeLicenseFiles([], {
        ...defaultOptions,
        outputFilename: 'bom.json',
      })

      expect(assetManager.addFile).toHaveBeenCalledTimes(1)
      expect(assetManager.addFile).toHaveBeenCalledWith(
        'bom.json',
        '{\n  "foo": "bar"\n}',
      )
    })

    it('options.additionalFiles adds additional files', async () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' })),
      )

      await instance.writeLicenseFiles([], {
        ...defaultOptions,
        additionalFiles: {
          'bom.json': o => `bom${JSON.stringify(o)}`,
          'bom_async.json': async o => `bom_async${JSON.stringify(o)}`,
          'bom_promise.json': o =>
            Promise.resolve(`bom_promise${JSON.stringify(o)}`),
        },
      })

      expect(assetManager.addFile).toHaveBeenCalledTimes(4)
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        1,
        defaultOptions.outputFilename,
        '{\n  "foo": "bar"\n}',
      )
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        2,
        'bom.json',
        'bom{"foo":"bar"}',
      )
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        3,
        'bom_async.json',
        'bom_async{"foo":"bar"}',
      )
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        4,
        'bom_promise.json',
        'bom_promise{"foo":"bar"}',
      )
    })
  })
})
