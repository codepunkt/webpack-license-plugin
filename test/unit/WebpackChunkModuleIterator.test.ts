import WebpackChunkModuleIterator from '../../src/WebpackChunkModuleIterator'

const moduleIterator = new WebpackChunkModuleIterator()

describe('WebpackChunkModuleIterator', () => {
  describe('iterateModules', () => {
    let callbackSpy

    beforeEach(() => {
      callbackSpy = jest.fn()
    })

    test("doesn't iterate without modules", () => {
      moduleIterator.iterateModules({}, callbackSpy)
      moduleIterator.iterateModules({ forEachModule: null }, callbackSpy)
      moduleIterator.iterateModules({ modules: null }, callbackSpy)
      expect(callbackSpy).toHaveBeenCalledTimes(0)
    })

    test('iterates over chunk.modulesIterable', () => {
      moduleIterator.iterateModules(
        { modulesIterable: [{ foo: 'bar' }, { baz: 'qux' }] },
        callbackSpy
      )
      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { foo: 'bar' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { baz: 'qux' })
    })

    test('iterates using chunk.forEachModule', () => {
      const forEachModuleSpy = jest.fn()
      moduleIterator.iterateModules(
        { forEachModule: forEachModuleSpy },
        callbackSpy
      )
      expect(forEachModuleSpy).toHaveBeenCalledTimes(1)
      expect(forEachModuleSpy).toHaveBeenNthCalledWith(1, callbackSpy)
    })

    test('iterates over chunk.modules', () => {
      moduleIterator.iterateModules(
        {
          modules: [{ resource: 'wibble' }, { resource: 'wobble' }],
        },
        callbackSpy
      )
      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { resource: 'wibble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { resource: 'wobble' })
    })

    test('takes entryModule into account', () => {
      moduleIterator.iterateModules(
        {
          modules: [{ resource: 'wibble' }, { resource: 'wobble' }],
          entryModule: 'flab',
        },
        callbackSpy
      )
      expect(callbackSpy).toHaveBeenCalledTimes(3)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { resource: 'wibble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { resource: 'wobble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(3, 'flab')
    })
  })
})
