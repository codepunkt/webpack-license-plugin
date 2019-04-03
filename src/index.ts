// @todo * license information (see old docs)
import fetch from 'cross-fetch'
import WebpackLicensePlugin from './WebpackLicensePlugin'

const g = (window || global) as any
g.fetch = fetch

export = WebpackLicensePlugin
