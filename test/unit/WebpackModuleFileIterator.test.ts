import WebpackModuleFileIterator from '../../src/WebpackModuleFileIterator'

const fileIterator = new WebpackModuleFileIterator()

describe('webpackModuleFileIterator', () => {
  describe('iterateFiles', () => {
    let callbackSpy

    beforeEach(() => {
      callbackSpy = jest.fn()
    })

    it('iterates over module.resource', () => {
      fileIterator.iterateFiles(
        {
          resource: '/home/codepunkt/.zshrc',
        },
        callbackSpy,
      )

      expect(callbackSpy).toHaveBeenCalledTimes(1)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.zshrc')
    })

    it('iterates over module.rootModule.resource', () => {
      fileIterator.iterateFiles(
        {
          rootModule: {
            resource: '/home/codepunkt/.npmrc',
          },
        },
        callbackSpy,
      )

      expect(callbackSpy).toHaveBeenCalledTimes(1)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.npmrc')
    })

    it('iterates over module.fileDependencies', () => {
      fileIterator.iterateFiles(
        {
          fileDependencies: [
            '/home/codepunkt/.bashrc',
            '/home/codepunkt/.vimrc',
          ],
        },
        callbackSpy,
      )

      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, '/home/codepunkt/.bashrc')
      expect(callbackSpy).toHaveBeenNthCalledWith(2, '/home/codepunkt/.vimrc')
    })

    it('iterates over module.dependencies', () => {
      fileIterator.iterateFiles(
        {
          dependencies: [
            { originModule: { resource: '/home/codepunkt/.prettierrc' } },
            { originModule: { resource: '/home/codepunkt/.nvmrc' } },
            { originModule: {} },
            { _parentModule: { resource: '/home/codepunkt/file1' } },
            { _parentModule: { resource: '/home/codepunkt/file2' } },
            { _parentModule: {} },
          ],
        },
        callbackSpy,
      )

      expect(callbackSpy).toHaveBeenCalledTimes(4)
      expect(callbackSpy).toHaveBeenNthCalledWith(
        1,
        '/home/codepunkt/.prettierrc',
      )
      expect(callbackSpy).toHaveBeenNthCalledWith(2, '/home/codepunkt/.nvmrc')
      expect(callbackSpy).toHaveBeenNthCalledWith(3, '/home/codepunkt/file1')
      expect(callbackSpy).toHaveBeenNthCalledWith(4, '/home/codepunkt/file2')
    })
  })
})
