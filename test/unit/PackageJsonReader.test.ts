import PackageJsonReader from '../../src/PackageJsonReader'
import IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem>(({ join, readFile }) => ({
  join: jest.fn().mockImplementation(join),
  readFile: jest.fn().mockImplementation(readFile),
}))

describe('PackageJsonReader', () => {
  describe('readPackageJson', () => {
    test('reads and parses package.json', () => {
      const instance = new PackageJsonReader(
        new FileSystem({
          readFile: f => `{"foo":"bar","file":"${f}"}`,
        })
      )
      const result = instance.readPackageJson('/path/to/directory')

      expect(result).toEqual({
        file: '/path/to/directory/package.json',
        foo: 'bar',
      })
    })

    test('reads from the cache when applicable', () => {
      const readFile = jest
        .fn()
        .mockImplementation(f => `{"foo":"bar","file":"${f}"}`)
      const instance = new PackageJsonReader(new FileSystem({ readFile }))

      instance.readPackageJson('/path/to/directory')
      instance.readPackageJson('/path/to/directory')

      expect(readFile).toHaveBeenCalledTimes(1)
    })
  })
})
