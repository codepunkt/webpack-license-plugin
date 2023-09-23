import process from 'node:process'
import ModuleDirectoryLocator from '../../src/ModuleDirectoryLocator'
import type IFileSystem from '../../src/types/IFileSystem'
import type IPackageJsonReader from '../../src/types/IPackageJsonReader'

const MockPackageJsonReader = jest.fn<IPackageJsonReader, any[]>((i) => i)

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
          pathExists: (p) => {
            return [
              ...(isWin
                ? [
                    'C:\\project\\node_modules\\a\\package.json',
                    'C:\\project\\node_modules\\a\\dist\\noversion\\package.json',
                    'C:\\project\\node_modules\\a\\dist\\noversion\\noname\\package.json',
                  ]
                : [
                    '/project/node_modules/a/package.json',
                    '/project/node_modules/a/dist/noversion/package.json',
                    '/project/node_modules/a/dist/noversion/noname/package.json',
                  ]),
            ].includes(p)
          },
        }),
        isWin ? 'C:\\project' : '/project',
        new MockPackageJsonReader({
          readPackageJson: (path) => {
            if (path.endsWith('noname')) {
              return { version: '1.0.0' }
            } else if (path.endsWith('noversion')) {
              return { name: 'foo' }
            } else {
              return { name: 'foo', version: '1.0.0' }
            }
          },
        })
      )

      expect(
        instance.getModuleDir(
          isWin
            ? 'C:\\project\\node_modules\\a\\dist\\noversion\\noname\\index.js'
            : '/project/node_modules/a/dist/noversion/noname/index.js'
        )
      ).toEqual(
        isWin ? 'C:\\project\\node_modules\\a' : '/project/node_modules/a'
      )
    })

    test('returns null for own sources', () => {
      const instance = new ModuleDirectoryLocator(
        new FileSystem({
          pathExists: (p: string) =>
            p ===
            (isWin ? 'C:\\project\\package.json' : '/project/package.json'),
        }),
        isWin ? 'C:\\project' : '/project',
        new MockPackageJsonReader({
          readPackageJson: (name) => ({ name, version: '1.0.0' }),
        })
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
          pathExists: () => false,
        }),
        isWin ? 'C:\\project' : '/project',
        new MockPackageJsonReader({
          readPackageJson: (name) => ({ name, version: '1.0.0' }),
        })
      )

      expect(
        instance.getModuleDir(
          isWin ? 'C:\\random\\src\\index.js' : '/random/src/index.js'
        )
      ).toEqual(null)
    })
  })
})
