export default interface IDefaultLicenseTextProvider {
  retrieveLicenseText: (license: string) => Promise<string | null>
}
