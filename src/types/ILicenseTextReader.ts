export default interface ILicenseTextReader {
  readLicenseText(license: string, moduleDir: string): string | null
}
