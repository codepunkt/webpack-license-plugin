import LicenseTextReader from '../../src/LicenseTextReader'
import IAlertAggregator from '../../src/types/IAlertAggregator'
import IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem>(({ join, listPaths, readFile }) => ({
  join: jest.fn().mockImplementation(join),
  listPaths: jest.fn().mockImplementation(listPaths),
  readFile: jest.fn().mockImplementation(readFile),
}))

const MockAlertAggregator = jest
  .fn<IAlertAggregator>()
  .mockImplementation(i => i)

describe('LicenseTextReader', () => {
  describe('getLicenseFilename', () => {
    test('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: d => ['index.js'] })
      )

      expect(instance.getLicenseFilename(['index.js'])).toEqual(null)
    })

    test('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: d => ['index.js', 'LICENSE'] })
      )

      expect(instance.getLicenseFilename(['index.js', 'LICENSE'])).toEqual(
        'LICENSE'
      )
    })
  })

  describe('readFile', () => {
    test('reads file contents', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          readFile: p => `license text in ${p}`,
        })
      )

      expect(instance.readFile('/path/to/directory', 'LICENSE')).toEqual(
        'license text in /path/to/directory/LICENSE'
      )
    })
  })

  describe('readLicenseText', () => {
    test('reads license file and returns contents', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          join: (d, f) => `${d}/${f}`,
          listPaths: d => ['index.js', 'LICENSE'],
          readFile: p => `license in ${p}`,
        })
      )
      const result = instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'MIT',
        '/path/to/directory'
      )

      expect(result).toEqual('license in /path/to/directory/LICENSE')
    })

    test('returns `null` when no license file was found', () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({ listPaths: d => ['index.js'] })
      )
      const result = instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'MIT',
        '/path/to/directory'
      )

      expect(result).toBe(null)
    })

    test("reads license from 'SEE LICENSE IN' file", () => {
      const instance = new LicenseTextReader(
        new MockAlertAggregator(),
        new FileSystem({
          listPaths: d => ['index.js', 'foo.md'],
          readFile: p => `foo in ${p}`,
        })
      )
      const result = instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'SEE LICENSE IN foo.md',
        '/path/to/directory'
      )

      expect(result).toEqual('foo in /path/to/directory/foo.md')
    })

    test("adds error when not able to read from 'SEE LICENSE IN' file", () => {
      const addError = jest.fn()
      const instance = new LicenseTextReader(
        new MockAlertAggregator({ addError }),
        new FileSystem({
          listPaths: d => ['index.js', 'foo.md'],
          readFile: p => {
            throw new Error('fail')
          },
        })
      )

      instance.readLicenseText(
        { name: 'bar', version: '1.0.0' },
        'SEE LICENSE IN foo.md',
        '/path/to/directory'
      )

      expect(addError).toHaveBeenCalledTimes(1)
      expect(addError).toHaveBeenCalledWith(
        'could not find file specified in package.json license field of bar@1.0.0'
      )
    })
  })
})
