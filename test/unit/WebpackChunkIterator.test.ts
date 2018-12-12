import WebpackChunkIterator from '../../src/WebpackChunkIterator'
import WebpackChunkModuleIterator from '../../src/WebpackChunkModuleIterator'
import WebpackModuleFileIterator from '../../src/WebpackModuleFileIterator'
import webpack = require('webpack')

const MockChunk = jest.fn<webpack.compilation.Chunk>(i => i)
const MockModuleIterator = jest.fn<WebpackChunkModuleIterator>(i => i)
const MockFileIterator = jest.fn<WebpackModuleFileIterator>(i => i)

describe('WebpackChunkIterator', () => {
  describe('iterateChunks', () => {
    test('returns a list of all file paths', () => {
      const instance = new WebpackChunkIterator(
        new MockModuleIterator({ iterateModules: (c, cb) => cb(c.name) }),
        new MockFileIterator({ iterateFiles: (f, cb) => cb(`/path/to/${f}`) })
      )

      const result = instance.iterateChunks([
        new MockChunk({ name: 'a' }),
        new MockChunk({ name: 'b' }),
      ])

      expect(result).toEqual(['/path/to/a', '/path/to/b'])
    })
  })
})
