import WebpackModuleFileIterator from '../../src/WebpackModuleFileIterator'

const fileIterator = new WebpackModuleFileIterator()

describe('WebpackModuleFileIterator', () => {
  describe('iterateFiles', () => {
    let callbackSpy

    beforeEach(() => {
      callbackSpy = jest.fn()
    })

    test('iterates over module.resource', () => {
      fileIterator.iterateFiles(
        {
          resource: '/home/codepunkt/.zshrc',
        },
        callbackSpy
      )

      expect(callbackSpy).toHaveBeenCalledTimes(1)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.zshrc')
    })

    test('iterates over module.rootModule.resource', () => {
      fileIterator.iterateFiles(
        {
          rootModule: {
            resource: '/home/codepunkt/.npmrc',
          },
        },
        callbackSpy
      )

      expect(callbackSpy).toHaveBeenCalledTimes(1)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.npmrc')
    })

    test('iterates over module.fileDependencies', () => {
      fileIterator.iterateFiles(
        {
          fileDependencies: [
            '/home/codepunkt/.bashrc',
            '/home/codepunkt/.vimrc',
          ],
        },
        callbackSpy
      )

      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.bashrc')
      expect(callbackSpy).toHaveBeenNthCalledWith(2, '/home/codepunkt/.vimrc')
    })

    test('iterates over module.dependencies', () => {
      fileIterator.iterateFiles(
        {
          dependencies: [
            { originModule: { resource: '/home/codepunkt/.prettierrc' } },
            { originModule: { resource: '/home/codepunkt/.nvmrc' } },
            { originModule: {} },
          ],
        },
        callbackSpy
      )

      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(
        1,
        '/home/codepunkt/.prettierrc'
      )
      expect(callbackSpy).toHaveBeenNthCalledWith(2, '/home/codepunkt/.nvmrc')
    })
  })
})
