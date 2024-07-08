import needle from 'needle'

export async function fetch(url: string): Promise<string | null> {
  const res = await needle('get', url)
  return res.statusCode === 200 ? res.body : null
}

export const REPO_URL
  = 'https://raw.githubusercontent.com/spdx/license-list-data'

interface IDefaultLicenseTextCache {
  [license: string]: string | null
}

export default class DefaultLicenseTextProvider {
  private cache: IDefaultLicenseTextCache = {}

  constructor(private request: typeof fetch = fetch) {}

  public async retrieveLicenseText(license: string): Promise<string | null> {
    if (!this.cache[license]) {
      const res = await this.request(`${REPO_URL}/master/text/${license}.txt`)
      this.cache[license] = res
    }

    return this.cache[license] || null
  }
}
