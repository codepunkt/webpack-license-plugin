import { join } from 'node:path'
import type IFileSystem from './types/IFileSystem'

/**
 * Reads notice text from notice file.
 *
 * If no notice file is found returns null.
 */
export default class NoticeTextReader {
  constructor(private fileSystem: IFileSystem) {}

  public async readNoticeText(moduleDir: string): Promise<string | null> {
    const noticeFilename = this.fileSystem
      .listPaths(moduleDir)
      .find(filename => /^notice/i.test(filename))

    if (!noticeFilename) {
      return null
    }

    const noticeFilePath = join(moduleDir, noticeFilename)
    return this.fileSystem.readFile(noticeFilePath).replace(/\r\n/g, '\n')
  }
}
