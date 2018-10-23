const fs = require('fs')
const { join } = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const { isArray, isFunction, isPlainObject, isString, map } = require('lodash')
const { exec } = require('child_process')
const getCompilationMeta = require('./getCompilationMeta')
const getSummary = require('./getSummary')
const getLicenseInfo = require('./getLicenseInfo')
const parse = require('spdx-expression-parse')

const defaults = {
  blacklist: [],
  outputFilename: 'oss-licenses.json',
  logLevel: 'info',
  overrides: {},
  outputTransform: null,
}

const logLevels = ['none', 'info', 'verbose']

class WebpackLicensePlugin {
  constructor({
    blacklist = defaults.blacklist,
    outputFilename = defaults.outputFilename,
    logLevel = defaults.logLevel,
    overrides = defaults.overrides,
    outputTransform = defaults.outputTransform,
  } = {}) {
    if (!logLevels.includes(logLevel)) {
      throw new Error('unknown logLevel!')
    }
    this.logLevel = logLevel

    if (!isArray(blacklist)) {
      throw new Error('blacklist is not an array!')
    }
    this.blacklist = blacklist

    if (!isString(outputFilename) || !outputFilename) {
      throw new Error('outputFilename is empty or not a string!')
    }
    this.outputFilename = outputFilename

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

    if (!isFunction(outputTransform) && outputTransform !== null) {
      throw new Error('outputTransform is not a method!')
    }
    this.outputTransform = outputTransform
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

    const tempFileName = join(process.cwd(), 'temp.json')

    // run license-checker on the given package versions to find out
    // license information
    exec(
      `${join(
        process.cwd(),
        'node_modules',
        '.bin',
        'license-checker'
      )} --json --start ${packageMeta[0].path.split('node_modules')[0]}${
        this.blacklist.length ? ` --failOn '${this.blacklist.join(';')}'` : ''
      } --packages '${packageVersions.join(';')}' --out ${tempFileName}`,
      // `npx --no-install license-checker --json --start ${
      //   packageMeta[0].path.split('node_modules')[0]
      // }${
      //   this.blacklist.length ? ` --failOn '${this.blacklist.join(';')}'` : ''
      // } --packages '${packageVersions.join(';')}' --out ${tempFileName}`,
      { maxBuffer: 1024 * 1024 * 10 }, // 10mb max buffer size
      async (err, stdout, stderr) => {
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
        const licenseInfo = getLicenseInfo(
          JSON.parse(fs.readFileSync(tempFileName, 'UTF-8'))
        ).map(li => ({
          ...li,
          license: this.overrides[`${li.name}@${li.version}`] || li.license,
        }))

        // remove temporary file
        fs.unlinkSync(tempFileName)

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

        const addFile = (filename, contents) => {
          compilation.assets[filename] = {
            source: function() {
              return contents
            },
            size: function() {
              return contents.length
            },
          }
        }

        // write outputFile
        const json = JSON.stringify({ summary, packages: licenseInfo }, null, 2)
        const output = this.outputTransform
          ? await this.outputTransform(json, addFile)
          : json

        addFile(this.outputFilename, output)

        callback()
      }
    )
  }
}

module.exports = WebpackLicensePlugin
