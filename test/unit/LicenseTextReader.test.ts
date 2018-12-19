import defaultOptions from '../../src/defaultOptions'
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
        new FileSystem({ listPaths: d => ['index.js'] }),
        defaultOptions
      )

      expect(instance.getLicenseFilename(['index.js'])).toEqual(null)
    })

    test('returns null if no license file is found', () => {
      const instance = new LicenseTextReader(
        new FileSystem({ listPaths: d => ['index.js', 'LICENSE'] }),
        defaultOptions
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
          readFile: p => `license text in ${p}`,
        }),
        defaultOptions
      )

      const result = instance.readFile('/path/to/directory', 'LICENSE')

      expect(result).toEqual('license text in /path/to/directory/LICENSE')
    })
  })

  describe('readLicenseText', () => {
    test('reads license file and returns contents', async () => {
      const instance = new LicenseTextReader(
        new FileSystem({
          join: (d, f) => `${d}/${f}`,
          listPaths: d => ['index.js', 'LICENSE'],
          readFile: p => `license in ${p}`,
        }),
        defaultOptions
      )

      const result = await instance.readLicenseText('MIT', '/path/to/directory')

      expect(result).toEqual('license in /path/to/directory/LICENSE')
    })

    test('returns `null` when no license file was found', async () => {
      const instance = new LicenseTextReader(
        new FileSystem({ listPaths: d => ['index.js'] }),
        defaultOptions
      )

      const result = await instance.readLicenseText('MIT', '/path/to/directory')

      expect(result).toBe(null)
    })

    test("reads license from 'SEE LICENSE IN' licensefile", async () => {
      const instance = new LicenseTextReader(
        new FileSystem({
          listPaths: d => ['index.js', 'foo.md'],
          readFile: p => `foo in ${p}`,
        }),
        defaultOptions
      )

      const result = await instance.readLicenseText(
        'SEE LICENSE IN foo.md',
        '/path/to/directory'
      )

      expect(result).toEqual('foo in /path/to/directory/foo.md')
    })
  })
})
