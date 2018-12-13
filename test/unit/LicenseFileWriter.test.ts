import defaultOptions from '../../src/defaultOptions'
import LicenseFileWriter from '../../src/LicenseFileWriter'
import IAssetManager from '../../src/types/IAssetManager'
import ILicenseMetaAggregator from '../../src/types/ILicenseMetaAggregator'
import IModuleDirectoryLocator from '../../src/types/IModuleDirectoryLocator'

const AssetManager = jest.fn<IAssetManager>(() => ({ addFile: jest.fn() }))
const DirectoryLocator = jest.fn<IModuleDirectoryLocator>(impl => ({
  getModuleDir: jest.fn().mockImplementation(impl),
}))
const MetaAggregator = jest.fn<ILicenseMetaAggregator>(impl => ({
  aggregateMeta: jest.fn().mockImplementation(impl),
}))

describe('LicenseFileWriter', () => {
  describe('getModuleDirs', () => {
    test('returns module dirs', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => undefined)
      )

      expect(instance.getModuleDirs(['index.js'])).toEqual(['dir-index.js'])
    })

    test('only returns unique module dirs', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => undefined)
      )

      expect(instance.getModuleDirs(['index.js', 'index.js'])).toEqual([
        'dir-index.js',
      ])
    })

    test('returns module dirs without null values', () => {
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => (d === 'a.js' ? 'module' : null)),
        new MetaAggregator(() => undefined)
      )

      expect(instance.getModuleDirs(['a.js', 'b.js'])).toEqual(['module'])
    })
  })

  describe('writeLicenseFiles', () => {
    test('adds meta file to the output', () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' }))
      )
      instance.writeLicenseFiles([], defaultOptions, () => undefined)

      expect(assetManager.addFile).toHaveBeenCalledTimes(1)
      expect(assetManager.addFile).toHaveBeenCalledWith(
        defaultOptions.outputFilename,
        '{\n  "foo": "bar"\n}'
      )
    })

    test('transforms output when options.outputTransform is set', () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' }))
      )
      const outputTransform = jest
        .fn()
        .mockImplementation(o => `transformed${o}`)
      instance.writeLicenseFiles(
        [],
        { ...defaultOptions, outputTransform },
        () => undefined
      )

      expect(outputTransform).toHaveBeenCalledTimes(1)
      expect(outputTransform).toHaveBeenCalledWith('{\n  "foo": "bar"\n}')
      expect(assetManager.addFile).toHaveBeenCalledTimes(1)
      expect(assetManager.addFile).toHaveBeenCalledWith(
        defaultOptions.outputFilename,
        'transformed{\n  "foo": "bar"\n}'
      )
    })

    test('adds a different file when options.outputFilename is set', () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' }))
      )
      instance.writeLicenseFiles(
        [],
        { ...defaultOptions, outputFilename: 'bom.json' },
        () => undefined
      )

      expect(assetManager.addFile).toHaveBeenCalledTimes(1)
      expect(assetManager.addFile).toHaveBeenCalledWith(
        'bom.json',
        '{\n  "foo": "bar"\n}'
      )
    })

    test('adds an additional file when options.additionalFiles', () => {
      const assetManager = new AssetManager()
      const instance = new LicenseFileWriter(
        assetManager,
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => ({ foo: 'bar' }))
      )
      instance.writeLicenseFiles(
        [],
        { ...defaultOptions, additionalFiles: { 'bom.json': o => `bom${o}` } },
        () => undefined
      )

      expect(assetManager.addFile).toHaveBeenCalledTimes(2)
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        1,
        defaultOptions.outputFilename,
        '{\n  "foo": "bar"\n}'
      )
      expect(assetManager.addFile).toHaveBeenNthCalledWith(
        2,
        'bom.json',
        'bom{\n  "foo": "bar"\n}'
      )
    })

    test('handles errors', () => {
      const errorHandler = jest.fn()
      const instance = new LicenseFileWriter(
        new AssetManager(),
        new DirectoryLocator(d => `dir-${d}`),
        new MetaAggregator(() => {
          throw new Error('failure')
        })
      )
      instance.writeLicenseFiles([], defaultOptions, errorHandler)

      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler).toHaveBeenCalledWith(new Error('failure'))
    })
  })
})
