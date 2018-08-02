const webpack = require('webpack')

module.exports = {
  compileWebpack: options => {
    return new Promise((resolve, reject) => {
      webpack(options, (err, stats) => {
        if (err) {
          return reject(err)
        } else if (stats.hasErrors()) {
          return reject(new Error(stats.toString()))
        }

        resolve(stats)
      })
    })
  },
}
