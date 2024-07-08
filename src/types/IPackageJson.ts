export default interface IPackageJson {
  name: string
  author?: string | { name: string, email?: string, url?: string }
  license?: string | { type: string, url: string }
  licenses?: Array<{ type: string, url: string }>
  repository?: { url: string }
  version: string
}
