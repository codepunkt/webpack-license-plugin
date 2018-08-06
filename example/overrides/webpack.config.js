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

  plugins: [
    new WebpackLicensePlugin({
      logLevel: 'none',
      overrides: {
        'object-assign@4.4.0': 'Apache-2.0',
      },
    }),
  ],

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
