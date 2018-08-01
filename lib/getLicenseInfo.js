const { reduce } = require('lodash')
const getNpmTarballUrl = require('get-npm-tarball-url').default
const { sep } = require('path')
const { readFileSync } = require('fs')

// combine license information of every versioned package with the
// npm tarball url, the package repository (optional) and the license
// text with copyrights (if found)
module.exports = function(licenseCheckerJson) {
  return reduce(
    licenseCheckerJson,
    (acc, { licenseFile: licenseFilePath, licenses: license, repository }, key) => {
      const at = key.lastIndexOf('@')
      const name = key.substr(0, at)
      const version = key.substr(at + 1)
      const source = getNpmTarballUrl(name, version)
      const licenseFilename = licenseFilePath.split(sep).pop()
      const licenseText = licenseFilename.match(/^licen[cs]e/i)
        ? readFileSync(licenseFilePath, 'UTF-8')
        : ''

      return [...acc, { name, version, repository, source, license, licenseText }]
    },
    [],
  )
}
