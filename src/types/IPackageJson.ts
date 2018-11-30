export default interface IPackageJson {
  name: string
  license?: string | { type: string; url: string }
  licenses?: Array<{ type: string; url: string }>
  version: string
}
