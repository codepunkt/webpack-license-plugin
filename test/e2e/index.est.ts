import MemoryFs = require('memory-fs')
import { resolve, sep } from 'path'
import * as webpack from 'webpack'
import WebpackLicensePlugin from '../../src'

const build = (
  plugin: WebpackLicensePlugin,
  fileSystem: MemoryFs,
  callback: (err: Error, stats: any) => void
) => {
  const compiler = webpack({
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
    plugins: [plugin],
  })

  compiler.outputFileSystem = fileSystem
  compiler.run((err, stats) => callback(err, stats.toJson()))
}

describe('e2e', () => {
  let fileSystem

  beforeEach(() => {
    fileSystem = new MemoryFs()
  })

  test('output matches snapshot', done => {
    build(
      new WebpackLicensePlugin({
        licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache-2.0' },
      }),
      fileSystem,
      (err, stats) => {
        const output = JSON.parse(
          fileSystem
            .readFileSync(`${stats.outputPath}${sep}oss-licenses.json`)
            .toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })

  test('output to a different outputFilename matches snapshot', done => {
    build(
      new WebpackLicensePlugin({
        outputFilename: 'bill-of-materials.json',
      }),
      fileSystem,
      (err, stats) => {
        const output = JSON.parse(
          fileSystem
            .readFileSync(`${stats.outputPath}${sep}bill-of-materials.json`)
            .toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })

  test('additionalFiles match snapshot', done => {
    build(
      new WebpackLicensePlugin({
        additionalFiles: {
          'reverse.txt': output =>
            output
              .split('')
              .reverse()
              .join(''),
        },
      }),
      fileSystem,
      (err, stats) => {
        const additionalFile = fileSystem
          .readFileSync(`${stats.outputPath}${sep}reverse.txt`)
          .toString()

        expect(err).toBe(null)
        expect(additionalFile).not.toBe(null)
        expect(additionalFile).toMatchSnapshot()

        done()
      }
    )
  })

  test('has compilation error on invalid configuration', done => {
    build(
      new WebpackLicensePlugin({
        licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache 2.0' },
      }),
      fileSystem,
      (err, stats) => {
        expect(err).toBe(null)
        expect(stats.errors).toEqual([
          'WebpackLicensePlugin: "Apache 2.0" in licenseOverrides option is not a valid SPDX expression!',
        ])

        done()
      }
    )
  })

  test('has compilation error when encountering unacceptable licenses', done => {
    build(
      new WebpackLicensePlugin({
        unacceptableLicenseTest: license => ['MIT'].includes(license),
      }),
      fileSystem,
      (err, stats) => {
        expect(err).toBe(null)
        expect(stats.errors).toEqual(
          expect.arrayContaining([
            'WebpackLicensePlugin: found unacceptable license "MIT" for get-npm-tarball-url@2.0.1',
          ])
        )

        done()
      }
    )
  })
})
