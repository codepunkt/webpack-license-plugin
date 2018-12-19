export default interface ILicenseTextReader {
  readLicenseText(license: string, moduleDir: string): Promise<string | null>
}
