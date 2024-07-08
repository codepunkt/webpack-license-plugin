import PackageJsonReader from '../../src/PackageJsonReader'
import type IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem, any[]>(({ join, readFile }) => ({
  join: jest.fn(join),
  readFile: jest.fn(readFile),
  listPaths: jest.fn(),
  pathExists: jest.fn(),
}))

describe('packageJsonReader', () => {
  describe('readPackageJson', () => {
    it('reads and parses package.json', () => {
      const instance = new PackageJsonReader(
        new FileSystem({ readFile: () => `{"foo":"bar"}` }),
      )

      const result = instance.readPackageJson('path')

      expect(result).toEqual({
        foo: 'bar',
      })
    })

    it('reads from the cache when applicable', () => {
      const readFile = jest.fn(() => `{"foo":"bar"}`)
      const instance = new PackageJsonReader(new FileSystem({ readFile }))

      instance.readPackageJson('/path/to/directory')
      instance.readPackageJson('/path/to/directory')

      expect(readFile).toHaveBeenCalledTimes(1)
    })
  })
})
