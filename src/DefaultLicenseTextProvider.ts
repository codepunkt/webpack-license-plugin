import * as http from 'https'
import IPluginOptions from './types/IPluginOptions'

const REPO_URL = 'https://raw.githubusercontent.com/spdx/license-list-data'

// @todo read from defaultLicenseTextDir, when given
// @todo handle http/fileread error - might use node-fetch (which has
// no dependencies by itself) for better error handling
export default class DefaultLicenseTextProvider {
  private cache = {}

  constructor(private options: Pick<IPluginOptions, 'defaultLicenseTextDir'>) {}

  public async retrieveLicenseText(license: string): Promise<string> {
    if (!this.cache[license]) {
      this.cache[license] = await this.request(
        `${REPO_URL}/master/text/${license}.txt`
      )
    }

    return this.cache[license]
  }

  private async request(url: string): Promise<string> {
    const result = (await new Promise(resolve => {
      http.get(url, resp => {
        let data = ''

        resp.on('data', chunk => {
          data += chunk
        })

        resp.on('end', () => resolve(data))
      })
    })) as Promise<string>

    return result
  }
}
