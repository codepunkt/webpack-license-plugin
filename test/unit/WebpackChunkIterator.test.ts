import type webpack from 'webpack'
import WebpackChunkIterator from '../../src/WebpackChunkIterator'
import type WebpackChunkModuleIterator from '../../src/WebpackChunkModuleIterator'
import type WebpackModuleFileIterator from '../../src/WebpackModuleFileIterator'

const MockChunk = jest.fn<webpack.Chunk, any[]>((i) => i)
const MockModuleIterator = jest.fn<WebpackChunkModuleIterator, any[]>((i) => i)
const MockFileIterator = jest.fn<WebpackModuleFileIterator, any[]>((i) => i)
const MockCompilation = jest.fn<webpack.Compilation, any[]>((i) => i)

describe('WebpackChunkIterator', () => {
  describe('iterateChunks', () => {
    test('returns a list of all file paths', () => {
      const compilation = new MockCompilation()

      const instance = new WebpackChunkIterator(
        new MockModuleIterator({ iterateModules: (co, c, cb) => cb(c.name) }),
        new MockFileIterator({ iterateFiles: (f, cb) => cb(`/path/to/${f}`) })
      )

      const result = instance.iterateChunks(
        compilation,
        new Set([new MockChunk({ name: 'a' }), new MockChunk({ name: 'b' })])
      )

      expect(result).toEqual(['/path/to/a', '/path/to/b'])
    })
  })
})
