const { resolve } = require('path')
// const WebpackLicensePlugin = require('../../dist/index').default

module.exports = {
  entry: resolve(__dirname, '../../src/index.ts'),
  output: {
    path: resolve(__dirname, 'e2e'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  mode: 'development',
  // plugins: [
  //   new WebpackLicensePlugin({
  //     additionalFiles: {
  //       'oss-summary.json': output => {
  //         return JSON.stringify(
  //           JSON.parse(output).reduce(
  //             (prev, { license }) => ({
  //               ...prev,
  //               [license]: prev[license] ? prev[license] + 1 : 1,
  //             }),
  //             {}
  //           ),
  //           null,
  //           2
  //         )
  //       },
  //     },
  //   }),
  // ],
}
