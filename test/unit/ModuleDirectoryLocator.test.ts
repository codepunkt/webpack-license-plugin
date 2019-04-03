import ModuleDirectoryLocator from '../../src/ModuleDirectoryLocator'
import IFileSystem from '../../src/types/IFileSystem'

const FileSystem = jest.fn<IFileSystem, any[]>(
  ({ join, pathExists, resolve }) => ({
    listPaths: jest.fn(),
    readFile: jest.fn(),
    join: jest.fn(join),
    pathExists: jest.fn(pathExists),
    resolve: jest.fn(resolve),
  })
)

const isWin = process.platform === 'win32'

describe('ModuleDirectoryLocator', () => {
  describe('getModuleDir', () => {
    test('finds module dir', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          pathExists: p =>
            p ===
            (isWin
              ? 'C:\\project\\node_modules\\a\\package.json'
              : '/project/node_modules/a/package.json'),
        }),
        isWin ? 'C:\\project' : '/project'
      )

      expect(
        instance.getModuleDir(
          isWin
            ? 'C:\\project\\node_modules\\a\\dist\\index.js'
            : '/project/node_modules/a/dist/index.js'
        )
      ).toEqual(
        isWin ? 'C:\\project\\node_modules\\a' : '/project/node_modules/a'
      )
    })

    test('returns null for own sources', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          pathExists: p =>
            p ===
            (isWin ? 'C:\\project\\package.json' : '/project/package.json'),
        }),
        isWin ? 'C:\\project' : '/project'
      )

      expect(
        instance.getModuleDir(
          isWin ? 'C:\\project\\src\\index.js' : '/project/src/index.js'
        )
      ).toEqual(null)
    })

    test('returns null for files outside of a module directory', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          pathExists: p => false,
        }),
        isWin ? 'C:\\project' : '/project'
      )

      expect(
        instance.getModuleDir(
          isWin ? 'C:\\random\\src\\index.js' : '/random/src/index.js'
        )
      ).toEqual(null)
    })
  })
})
