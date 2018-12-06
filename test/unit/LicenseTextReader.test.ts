import LicenseTextReader from '../../src/LicenseTextReader'
import IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem>(({ join, listPaths, readFile }) => ({
  join: jest.fn().mockImplementation(join),
  listPaths: jest.fn().mockImplementation(listPaths),
  readFile: jest.fn().mockImplementation(readFile),
}))

describe('LicenseTextReader', () => {
  describe('getLicenseFilename', () => {
    test('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
        new FileSystem({ listPaths: d => ['index.js'] })
      )

      expect(instance.getLicenseFilename(['index.js'])).toEqual(null)
    })

    test('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
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
        new FileSystem({
          join: (d, f) => `${d}#${f}`,
          readFile: p => `license text in ${p}`,
        })
      )

      expect(instance.readFile('/path/to/directory', 'LICENSE')).toEqual(
        'license text in /path/to/directory#LICENSE'
      )
    })
  })

  describe('readLicenseText', () => {
    test('reads license file and returns contents', () => {
      const instance = new LicenseTextReader(
        new FileSystem({
          join: (d, f) => `${d}/${f}`,
          listPaths: d => ['index.js', 'LICENSE'],
          readFile: p => `license in ${p}`,
        })
      )
      const result = instance.readLicenseText('MIT', '/path/to/directory')

      expect(result).toEqual('license in /path/to/directory/LICENSE')
    })

    test('returns `null` when no license file was found', () => {
      const instance = new LicenseTextReader(
        new FileSystem({ listPaths: d => ['index.js'] })
      )
      const result = instance.readLicenseText('MIT', '/path/to/directory')

      expect(result).toBe(null)
    })

    test("reads license from 'SEE LICENSE IN' licensefile", () => {
      const instance = new LicenseTextReader(
        new FileSystem({
          join: (d, f) => `${d}!${f}`,
          listPaths: d => ['index.js', 'foo.md'],
          readFile: p => `foo in ${p}`,
        })
      )
      const result = instance.readLicenseText(
        'SEE LICENSE IN foo.md',
        '/path/to/directory'
      )

      expect(result).toEqual('foo in /path/to/directory!foo.md')
    })
  })
})
