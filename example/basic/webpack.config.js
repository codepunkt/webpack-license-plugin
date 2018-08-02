var WebpackLicensePlugin = require('../../lib')
var path = require('path')

module.exports = {
  devtool: 'source-map',

  context: __dirname,

  entry: {
    app: './src/index.js',
  },

  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
    libraryTarget: 'umd',
    publicPath: '/',
  },

  mode: 'production',

  plugins: [new WebpackLicensePlugin({ logLevel: 'none' })],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
    ],
  },
}
