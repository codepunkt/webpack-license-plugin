import WebpackFileSystem from '../../src/WebpackFileSystem'

describe('webpackFileSystem', () => {
  describe('pathExists', () => {
    it('uses webpack.InputFileSystem.statSync to check the existance of a file', () => {
      const instance = new WebpackFileSystem({
        statSync: (filename) => {
          if (filename !== '/path/to/existing_file') {
            throw new Error('file doesn\'t exist')
          }
        },
      })

      expect(instance.pathExists('/path/to/existing_file')).toBe(true)
      expect(instance.pathExists('/path/to/not_existing_file')).toBe(false)
    })
  })

  describe('readFile', () => {
    it('uses webpack.InputFileSystem.readFileSync to read the file', () => {
      const instance = new WebpackFileSystem({
        readFileSync: filename => ({
          toString: () => `contents of ${filename}`,
        }),
      })

      expect(instance.readFile('/path/to/existing_file')).toBe(
        'contents of /path/to/existing_file',
      )
      expect(instance.readFile('/path/to/not_existing_file')).toBe(
        'contents of /path/to/not_existing_file',
      )
    })
  })

  describe('listPaths', () => {
    it('uses webpack.InputFileSystem\'s readdirSync to return the paths in a directory', () => {
      const instance = new WebpackFileSystem({
        readdirSync: () => ['existing_file', 'not_existing_file'],
      })

      expect(instance.listPaths('/path/to')).toEqual([
        'existing_file',
        'not_existing_file',
      ])
    })
  })
})
