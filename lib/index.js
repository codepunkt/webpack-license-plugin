const { readFileSync } = require('fs')
const { join } = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const { map } = require('lodash')
const { execSync } = require('child_process')
const getCompilationMeta = require('./getCompilationMeta')
const getLicenseInfo = require('./getLicenseInfo')

const defaults = {
  fileName: 'oss-licenses.json',
  logLevel: 'info',
}

const logLevels = ['none', 'info', 'verbose']

class WebpackLicensePlugin {
  constructor({ fileName = defaults.fileName, logLevel = defaults.logLevel } = {}) {
    this.fileName = fileName
    if (!logLevels.includes(logLevel)) {
      logLevel = defaults.logLevel
    }
    this.logLevel = logLevel
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

    // no packages in build?
    if (packageMeta.length === 0) {
      if (this.logLevel !== 'none') {
        console.log(`\n${chalk.blue.bold('WebpackLicensePlugin found no OSS licenses.')}`)
      }

      return callback()
    }

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

    // inform about the amount of packages with license information that were found
    if (this.logLevel !== 'none') {
      console.log(
        `\n${chalk.blue.bold(
          `WebpackLicensePlugin found ${licenseInfo.length} OSS licensed packages.`,
        )}`,
      )
    }

    // in verbose mode, also log out a table of package name, version and license
    if (this.logLevel === 'verbose') {
      const items = licenseInfo.map(li => [li.name, li.version, li.license])
      const table = new Table({
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: ['name', 'version', 'license'],
        colWidths: [
          Math.max(...[...items.map(i => i[0].length), 'name'.length]) + 2,
          Math.max(...[...items.map(i => i[1].length), 'version'.length]) + 2,
          Math.max(...[...items.map(i => i[2].length), 'license'.length]) + 2,
        ],
      })

      table.push(['', '', ''], ...items)
      console.log(table.toString())
    }

    // write file with detailed information
    if (this.fileName) {
      const fileContents = JSON.stringify(licenseInfo, null, 2)
      compilation.assets[this.fileName] = {
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
