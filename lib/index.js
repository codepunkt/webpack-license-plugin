const fs = require('fs')
const { join } = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const { isArray, isPlainObject, isString, map } = require('lodash')
const { exec } = require('child_process')
const getCompilationMeta = require('./getCompilationMeta')
const getSummary = require('./getSummary')
const getLicenseInfo = require('./getLicenseInfo')
const parse = require('spdx-expression-parse')

const defaults = {
  blacklist: [],
  fileName: 'oss-licenses.json',
  logLevel: 'info',
  overrides: {},
}

const logLevels = ['none', 'info', 'verbose']

class WebpackLicensePlugin {
  constructor({
    blacklist = defaults.blacklist,
    fileName = defaults.fileName,
    logLevel = defaults.logLevel,
    overrides = defaults.overrides,
  } = {}) {
    if (!logLevels.includes(logLevel)) {
      throw new Error('unknown logLevel!')
    }
    this.logLevel = logLevel

    if (!isArray(blacklist)) {
      throw new Error('blacklist is not an array!')
    }
    this.blacklist = blacklist

    if (!isString(fileName) || !fileName) {
      throw new Error('fileName is empty or not a string!')
    }
    this.fileName = fileName

    if (!isPlainObject(overrides)) {
      throw new Error('overrides is not an object!')
    }
    Object.keys(overrides).forEach(key => {
      try {
        parse(overrides[key])
      } catch (e) {
        throw new Error(
          `override ${
            overrides[key]
          } for ${key} is not a valid spdx expression!`
        )
      }
    })
    this.overrides = overrides
  }

  apply(compiler) {
    // backwards compatible hook
    const emit = compiler.hooks
      ? compiler.hooks.emit.tapAsync.bind(
          compiler.hooks.emit,
          'webpack-license-plugin'
        )
      : compiler.plugin.bind(compiler, 'emit')

    emit(this.handleEmit.bind(this))
  }

  handleEmit(compilation, callback) {
    // get package meta information from compilation
    const packageMeta = getCompilationMeta(compilation)

    // no packages in build?
    if (packageMeta.length === 0) {
      if (this.logLevel !== 'none') {
        console.log(
          `\n${chalk.blue.bold(
            'WebpackLicensePlugin found no OSS licensed packages.'
          )}`
        )
      }

      return callback()
    }

    // build an array of package@version strings by reading the package.json
    // file of every package
    const packageVersions = map(packageMeta, ({ name, path }) => {
      const packageJson = JSON.parse(
        fs.readFileSync(join(path, 'package.json'), 'UTF-8')
      )
      return `${name}@${packageJson.version}`
    })

    // run license-checker on the given package versions to find out
    // license information
    exec(
      `npx --no-install license-checker --json --start ${
        packageMeta[0].path.split('node_modules')[0]
      }${
        this.blacklist.length ? ` --failOn '${this.blacklist.join(';')}'` : ''
      } --packages '${packageVersions.join(';')}'`,
      { maxBuffer: 1024 * 1024 * 10 }, // 10mb max buffer size
      (err, stdout, stderr) => {
        if (err) {
          const match = stderr.match(
            /Found license defined by the --failOn flag: "(.*)"/i
          )
          if (match && match[1]) {
            compilation.errors.push(
              new Error(
                `WebpackLicensePlugin: found blacklisted license "${match[1]}"`
              )
            )
          }
          return callback()
        }

        // convert license-checker information to an array and apply
        // overrides
        const licenseInfo = getLicenseInfo(JSON.parse(stdout.toString())).map(
          li => ({
            ...li,
            license: this.overrides[`${li.name}@${li.version}`] || li.license,
          })
        )

        // calculate summary
        const summary = getSummary(licenseInfo)

        // inform about the amount of packages with license information that were found
        if (this.logLevel !== 'none') {
          console.log(
            `\n${chalk.blue.bold(
              `WebpackLicensePlugin found ${
                licenseInfo.length
              } OSS licensed packages.`
            )}`
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
              Math.max(...[...items.map(i => i[1].length), 'version'.length]) +
                2,
              Math.max(...[...items.map(i => i[2].length), 'license'.length]) +
                2,
            ],
          })

          table.push(['', '', ''], ...items)
          console.log(table.toString())
        }

        // write file with detailed information
        const fileContents = JSON.stringify(
          { summary, packages: licenseInfo },
          null,
          2
        )
        compilation.assets[this.fileName] = {
          source: function() {
            return fileContents
          },
          size: function() {
            return fileContents.length
          },
        }

        callback()
      }
    )
  }
}

module.exports = WebpackLicensePlugin
