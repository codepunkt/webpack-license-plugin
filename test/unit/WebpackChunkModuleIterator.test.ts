import webpack = require('webpack')
import WebpackChunkModuleIterator from '../../src/WebpackChunkModuleIterator'

const moduleIterator = new WebpackChunkModuleIterator()
const MockCompilation = jest.fn<webpack.compilation.Compilation, any[]>((i) => i)

describe('WebpackChunkModuleIterator', () => {
  describe('iterateModules', () => {
    let callbackSpy

    beforeEach(() => {
      callbackSpy = jest.fn()
    })

    test("doesn't iterate without modules", () => {
      const compilation = new MockCompilation()
      moduleIterator.iterateModules(compilation, {}, callbackSpy)
      moduleIterator.iterateModules(compilation, { forEachModule: null }, callbackSpy)
      moduleIterator.iterateModules(compilation, { modules: null }, callbackSpy)
      expect(callbackSpy).toHaveBeenCalledTimes(0)
    })

    test('iterates over compilation.chunkGraph (webpack v5)', () => {
      const compilation = new MockCompilation({
        chunkGraph: {
          getChunkModulesIterable: jest.fn((i) => [{ foo: 'bar' }, { baz: 'qux' }]), // Frage: woher soll dieser Return kommen?
          getChunkEntryModulesIterable: jest.fn((i) => [{ foo: 'bar' }, { baz: 'qux' }]),
        },
      })

      moduleIterator.iterateModules(compilation, {}, callbackSpy)
      expect(callbackSpy).toHaveBeenCalledTimes(4)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { foo: 'bar' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { baz: 'qux' })
    })

    test('iterates over chunk.modulesIterable', () => {
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
        { modulesIterable: [{ foo: 'bar' }, { baz: 'qux' }] },
        callbackSpy
      )
      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { foo: 'bar' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { baz: 'qux' })
    })

    test('iterates using chunk.forEachModule', () => {
      const compilation = new MockCompilation()

      const forEachModuleSpy = jest.fn()
      moduleIterator.iterateModules(compilation, { forEachModule: forEachModuleSpy }, callbackSpy)
      expect(forEachModuleSpy).toHaveBeenCalledTimes(1)
      expect(forEachModuleSpy).toHaveBeenNthCalledWith(1, callbackSpy)
    })

    test('iterates over chunk.modules', () => {
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
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
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
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
