export default interface INoticeTextReader {
  readNoticeText: (moduleDir: string) => Promise<string | null>
}
