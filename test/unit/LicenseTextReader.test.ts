import type IAlertAggregator from '../../src/types/IAlertAggregator'
import type IDefaultLicenseTextProvider from '../../src/types/IDefaultLicenseTextProvider'
import type IFileSystem from '../../src/types/IFileSystem'
import { sep } from 'node:path'
import defaultOptions from '../../src/defaultOptions'
import LicenseTextReader from '../../src/LicenseTextReader'

const FileSystem = jest.fn<IFileSystem, any[]>(
  ({ join, listPaths, readFile }) => ({
    join: jest.fn(join),
    listPaths: jest.fn(listPaths),
    readFile: jest.fn(readFile),
    pathExists: jest.fn(),
  }),
)

const DefaultLicenseTextProvider = jest.fn<IDefaultLicenseTextProvider, any[]>(
  ({ retrieveLicenseText }) => ({
    retrieveLicenseText: jest.fn(retrieveLicenseText),
  }),
)

const MockAlertAggregator = jest.fn<IAlertAggregator, any[]>(i => i)

describe('licenseTextReader', () => {
  describe('getLicenseFilename', () => {
    it('returns null if the license is undefined', async () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: () => ['index.js'] }),
        defaultOptions,
      )

      const result = await instance.readLicenseText(
        { name: 'foo', version: 'bla' },
        '',
        `${sep}path${sep}to${sep}directory`,
      )

      expect(result).toBe(null)
    })

    it('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: () => ['index.js'] }),
        defaultOptions,
      )

      expect(instance.getLicenseFilename(['index.js'])).toEqual(null)
    })

    it('returns license file name otherwise', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: () => ['index.js', 'LICENSE'] }),
        defaultOptions,
      )

      expect(instance.getLicenseFilename(['index.js', 'LICENSE'])).toEqual(
        'LICENSE',
      )
    })
  })

  describe('readFile', () => {
    it('reads file contents', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          readFile: p => `license text in ${p}`,
        }),
        defaultOptions,
      )

      const result = instance.readFile('path', 'LICENSE')

      expect(result).toEqual(`license text in path${sep}LICENSE`)
    })
  })

  describe('readLicenseText', () => {
    it('reads license file and returns contents', async () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          join: (d, f) => `${d}/${f}`,
          listPaths: () => ['index.js', 'LICENSE'],
          readFile: p => `license in ${p}`,
        }),
        defaultOptions,
      )

      const result = await instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'MIT',
        `${sep}path${sep}to${sep}directory`,
      )

      expect(result).toEqual(
        `license in ${sep}path${sep}to${sep}directory${sep}LICENSE`,
      )
    })

    it('returns `null` when no license file was found', async () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: () => ['index.js'] }),
        defaultOptions,
      )

      const result = await instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'MIT',
        '/path/to/directory',
      )

      expect(result).toBe(null)
    })

    it('respects replenishDefaultLicenseTexts option', async () => {
      const licenseTextProvider = new DefaultLicenseTextProvider({
        retrieveLicenseText: () => 'wat',
      })
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: () => ['index.js'] }),
        { ...defaultOptions, replenishDefaultLicenseTexts: true },
        licenseTextProvider,
      )

      const result = await instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'MIT',
        '/path/to/directory',
      )

      expect(result).toBe('wat')
      expect(licenseTextProvider.retrieveLicenseText).toHaveBeenCalledTimes(1)
      expect(licenseTextProvider.retrieveLicenseText).toHaveBeenNthCalledWith(
        1,
        'MIT',
      )
    })

    it('reads license from \'SEE LICENSE IN\' licensefile', async () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          listPaths: () => ['index.js', 'foo.md'],
          readFile: p => `foo in ${p}`,
        }),
        defaultOptions,
      )

      const result = await instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'SEE LICENSE IN foo.md',
        `${sep}path${sep}to${sep}directory`,
      )

      expect(result).toEqual(
        `foo in ${sep}path${sep}to${sep}directory${sep}foo.md`,
      )
    })

    it('adds error when not able to read from \'SEE LICENSE IN\' file', () => {
      const addError = jest.fn()
      const instance = new LicenseTextReader(
        new MockAlertAggregator({ addError }),
        new FileSystem({
          listPaths: () => ['index.js', 'foo.md'],
          readFile: () => {
            throw new Error('fail')
          },
        }),
        defaultOptions,
      )

      instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'SEE LICENSE IN foo.md',
        '/path/to/directory',
      )

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'could not find file specified in package.json license field of bar@1.0.0',
      )
    })
  })
})
