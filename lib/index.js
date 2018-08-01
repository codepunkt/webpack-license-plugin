const { readFileSync } = require('fs')
const { join } = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const { map } = require('lodash')
const { execSync } = require('child_process')
const getCompilationMeta = require('./getCompilationMeta')
const getLicenseInfo = require('./getLicenseInfo')

class WebpackLicensePlugin {
  constructor({ jsonFilename, logToConsole }) {
    this.jsonFilename = jsonFilename
    this.logToConsole = logToConsole
  }

  apply(compiler) {
    // backwards compatible hook
    const emit = compiler.hooks
      ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'webpack-license-plugin')
      : compiler.plugin.bind(compiler, 'emit')

    emit(this.handleEmit.bind(this))
  }

  handleEmit(compilation, callback) {
    // get package meta information from compilation
    const packageMeta = getCompilationMeta(compilation)

    // build an array of package@version strings by reading the package.json
    // file of every package
    const packageVersions = map(packageMeta, ({ name, path }) => {
      const packageJson = JSON.parse(readFileSync(join(path, 'package.json'), 'UTF-8'))
      return `${name}@${packageJson.version}`
    })

    // run license-checker on the given package versions to find out
    // license information
    const licenseCheckerStdout = execSync(
      `npx --no-install license-checker --json --start ${
        packageMeta[0].path.split('node_modules')[0]
      } --packages '${packageVersions.join(';')}'`,
    )

    // convert license-checker information to an array
    const licenseInfo = getLicenseInfo(JSON.parse(licenseCheckerStdout.toString()))

    // log packages and their licenses to console
    if (this.logToConsole) {
      console.log(`\n${chalk.blue.bold('OSS licenses found:')}`)

      const items = licenseInfo.map(li => [li.name, li.version, li.license])
      const table = new Table({
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: ['name', 'version', 'license'],
        colWidths: [
          Math.max(...items.map(i => i[0].length)) + 2,
          Math.max(...items.map(i => i[1].length)) + 2,
          Math.max(...items.map(i => i[2].length)) + 2,
        ],
      })

      table.push(['', '', ''], ...items)
      console.log(table.toString())
    }

    // write file with detailed information
    if (this.jsonFilename) {
      const fileContents = JSON.stringify(licenseInfo, null, 2)
      compilation.assets[this.jsonFilename] = {
        source: function() {
          return fileContents
        },
        size: function() {
          return fileContents.length
        },
      }
    }

    callback()
  }
}

module.exports = WebpackLicensePlugin
