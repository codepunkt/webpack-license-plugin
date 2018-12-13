import { resolve } from 'path'
import ModuleDirectoryLocator from '../../src/ModuleDirectoryLocator'
import IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem>(({ join, pathExists, resolve }) => ({
  join: jest.fn().mockImplementation(join),
  pathExists: jest.fn().mockImplementation(pathExists),
  resolve: jest.fn().mockImplementation(resolve),
}))

describe('ModuleDirectoryLocator', () => {
  describe('getModuleDir', () => {
    test('finds module dir', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          join: (...paths) => paths.join('/'),
          pathExists: p => p === '/project/node_modules/a/package.json',
          resolve: p => resolve(p),
        }),
        '/project'
      )

      expect(
        instance.getModuleDir('/project/node_modules/a/dist/index.js')
      ).toEqual('/project/node_modules/a')
    })

    test('returns null for own sources', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          join: (...paths) => paths.join('/'),
          pathExists: p => p === '/project/package.json',
          resolve: p => resolve(p),
        }),
        '/project'
      )

      expect(instance.getModuleDir('/project/src/index.js')).toEqual(null)
    })

    test('returns null for files outside of a module directory', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          join: (...paths) => paths.join('/'),
          pathExists: p => false,
          resolve: p => resolve(p),
        }),
        '/project'
      )

      expect(instance.getModuleDir('/random/src/index.js')).toEqual(null)
    })
  })
})
