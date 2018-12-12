import WebpackAssetManager from '../../src/WebpackAssetManager'
import webpack = require('webpack')

const MockCompilation = jest.fn<webpack.compilation.Compilation>(i => i)

describe('WebpackAssetManager', () => {
  describe('addFile', () => {
    test('adds file to compilation assets', () => {
      const assets = {}
      const compilation = new MockCompilation({ assets })
      const instance = new WebpackAssetManager(compilation)

      const fileName = 'bom.json'
      const fileContents = 'bill of materials'
      instance.addFile(fileName, fileContents)

      expect(Object.keys(compilation.assets)).toEqual([fileName])
      expect(compilation.assets[fileName].size()).toEqual(fileContents.length)
      expect(compilation.assets[fileName].source()).toEqual(fileContents)
    })
  })
})
