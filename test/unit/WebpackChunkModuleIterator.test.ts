import type { Module } from 'webpack'
import type { Compilation } from '../../src/WebpackChunkModuleIterator'
import WebpackChunkModuleIterator from '../../src/WebpackChunkModuleIterator'

const moduleIterator = new WebpackChunkModuleIterator()
const MockCompilation = jest.fn<Compilation, any[]>(i => i)
const MockModule = jest.fn<Module, any[]>(i => i)

describe('webpackChunkModuleIterator', () => {
  describe('iterateModules', () => {
    let callbackSpy

    beforeEach(() => {
      callbackSpy = jest.fn()
    })

    it('doesn\'t iterate without modules', () => {
      const compilation = new MockCompilation()
      moduleIterator.iterateModules(compilation, {}, callbackSpy)
      moduleIterator.iterateModules(
        compilation,
        { forEachModule: undefined },
        callbackSpy,
      )
      moduleIterator.iterateModules(
        compilation,
        { modules: undefined },
        callbackSpy,
      )
      expect(callbackSpy).toHaveBeenCalledTimes(0)
    })

    it('iterates over compilation.chunkGraph (webpack v5)', () => {
      const compilation = new MockCompilation({
        chunkGraph: {
          getChunkModulesIterable: jest.fn(() => [
            { foo: 'bar' },
            { baz: 'qux' },
          ]), // Frage: woher soll dieser Return kommen?
          getChunkEntryModulesIterable: jest.fn(() => [
            { foo: 'bar' },
            { baz: 'qux' },
          ]),
        },
      })

      moduleIterator.iterateModules(compilation, {}, callbackSpy)
      expect(callbackSpy).toHaveBeenCalledTimes(4)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { foo: 'bar' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { baz: 'qux' })
    })

    it('iterates over chunk.modulesIterable', () => {
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
        {
          modulesIterable: [
            new MockModule({ foo: 'bar' }),
            new MockModule({ baz: 'qux' }),
          ],
        },
        callbackSpy,
      )
      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { foo: 'bar' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { baz: 'qux' })
    })

    it('iterates using chunk.forEachModule', () => {
      const compilation = new MockCompilation()

      const forEachModuleSpy = jest.fn()
      moduleIterator.iterateModules(
        compilation,
        { forEachModule: forEachModuleSpy },
        callbackSpy,
      )
      expect(forEachModuleSpy).toHaveBeenCalledTimes(1)
      expect(forEachModuleSpy).toHaveBeenNthCalledWith(1, callbackSpy)
    })

    it('iterates over chunk.modules', () => {
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
        {
          modules: [{ resource: 'wibble' }, { resource: 'wobble' }],
        },
        callbackSpy,
      )
      expect(callbackSpy).toHaveBeenCalledTimes(2)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { resource: 'wibble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { resource: 'wobble' })
    })

    it('takes entryModule into account', () => {
      const compilation = new MockCompilation()

      moduleIterator.iterateModules(
        compilation,
        {
          modules: [{ resource: 'wibble' }, { resource: 'wobble' }],
          entryModule: new MockModule({ entry: 'module' }),
        },
        callbackSpy,
      )
      expect(callbackSpy).toHaveBeenCalledTimes(3)
      expect(callbackSpy).toHaveBeenNthCalledWith(1, { resource: 'wibble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(2, { resource: 'wobble' })
      expect(callbackSpy).toHaveBeenNthCalledWith(3, { entry: 'module' })
    })
  })
})
