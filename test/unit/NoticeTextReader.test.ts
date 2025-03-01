import type IFileSystem from '../../src/types/IFileSystem'
import { sep } from 'node:path'
import NoticeTextReader from '../../src/NoticeTextReader'

const FileSystem = jest.fn<IFileSystem, any[]>(
  ({ listPaths, readFile, pathExists }) => ({
    listPaths: jest.fn(listPaths),
    readFile: jest.fn(readFile),
    pathExists: jest.fn(pathExists),
  }),
)

describe('noticeTextReader', () => {
  describe('readNoticeText', () => {
    it.each(['NOTICE', 'NOTICE.txt', 'NOTICE.md'])(
      'reads file `%p` and returns contents',
      async (filename) => {
        const instance = new NoticeTextReader(
          new FileSystem({
            listPaths: _ => ['README.md', 'LICENSE', filename],
            readFile: p => `notice in ${p}`,
          }),
        )

        const moduleDir = `${sep}path${sep}to${sep}directory`
        const result = await instance.readNoticeText(moduleDir)
        expect(result).toEqual(
          `notice in ${sep}path${sep}to${sep}directory${sep}${filename}`,
        )
      },
    )

    it('returns `null` if notice file not exists', async () => {
      const instance = new NoticeTextReader(
        new FileSystem({
          listPaths: _ => ['README.md', 'LICENSE'],
        }),
      )

      const moduleDir = `${sep}path${sep}to${sep}directory`
      const result = await instance.readNoticeText(moduleDir)

      expect(result).toBe(null)
    })
  })
})
