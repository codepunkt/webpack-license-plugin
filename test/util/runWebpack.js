const fs = require('fs')
const { sep } = require('path')
const webpack = require('webpack')
const LicensePlugin = require('../../lib')
const config = require('../example/webpack.config')

const createWebpackConfig = (pluginOptions, entryPath) => {
  return {
    ...config,
    plugins: [new LicensePlugin(pluginOptions)],
    entry: { app: entryPath || config.entry.app },
  }
}

// executes a webpack compilation and returns an array with 2 values:
// - the contents of the resulting outpultFilename or null when
//   none is written
// - the array of all webpack build asset filenames
module.exports = (pluginOptions, entryPath) => {
  return new Promise((resolve, reject) => {
    webpack(createWebpackConfig(pluginOptions, entryPath), (err, stats) => {
      if (err) {
        return reject(err)
      } else if (stats.hasErrors()) {
        return reject(new Error(stats.toString()))
      }

      const json = stats.toJson()
      const files = json.assets.map(x => x.name)
      const filename =
        (pluginOptions || {}).outputFilename || 'oss-licenses.json'
      const readFile = filename =>
        fs.readFileSync(`${json.outputPath}${sep}${filename}`).toString()

      resolve([
        files.includes(filename) ? readFile(filename) : null,
        files,
        readFile,
      ])
    })
  })
}
