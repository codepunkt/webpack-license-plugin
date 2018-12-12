import MemoryFs = require('memory-fs')
import { resolve, sep } from 'path'
import * as webpack from 'webpack'
import * as webpack3 from 'webpack3'
import WebpackLicensePlugin from '../../src'

const outputPath = resolve(__dirname, './example/dist')

const buildV3 = (
  plugin: WebpackLicensePlugin,
  fileSystem: MemoryFs,
  callback: (err: Error, stats: any) => void
) => {
  const compiler = webpack3({
    entry: resolve(__dirname, './example/src/index.js'),
    output: {
      path: outputPath,
    },
    target: 'node',
    plugins: [plugin],
  })

  compiler.outputFileSystem = fileSystem
  compiler.run((err, stats) => callback(err, stats.toJson()))
}

const buildV4 = (
  plugin: WebpackLicensePlugin,
  fileSystem: MemoryFs,
  callback: (err: Error, stats: any) => void
) => {
  const compiler = webpack({
    entry: resolve(__dirname, './example/src/index.js'),
    output: {
      path: outputPath,
    },
    target: 'node',
    plugins: [plugin],
  })

  compiler.outputFileSystem = fileSystem
  compiler.run((err, stats) => callback(err, stats.toJson()))
}

/**
 * @todo
 *  why is prop-types included in webpack v3 output?
 *
 * @todo
 *  automatically run identical e2e tests for multiple
 *  versions of webpack
 */

// const webpackVersions = [
//   { description: 'webpack v4', webpack },
//   { description: 'webpack v3', webpack: webpack3 },
// ]

describe('end to end', () => {
  describe('webpack v4', () => {
    let fileSystem

    beforeEach(() => {
      fileSystem = new MemoryFs()
    })
    test('output matches snapshot', done => {
      buildV4(
        new WebpackLicensePlugin({
          licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache-2.0' },
        }),
        fileSystem,
        (err, stats) => {
          const output = JSON.parse(
            fileSystem
              .readFileSync(`${outputPath}${sep}oss-licenses.json`)
              .toString()
          )
          console.log(output)

          expect(err).toBe(null)
          expect(output).not.toBe(null)
          expect(output).toMatchSnapshot()

          done()
        }
      )
    })

    test('output to a different outputFilename matches snapshot', done => {
      buildV4(
        new WebpackLicensePlugin({
          outputFilename: 'bill-of-materials.json',
        }),
        fileSystem,
        (err, stats) => {
          const output = JSON.parse(
            fileSystem
              .readFileSync(`${outputPath}${sep}bill-of-materials.json`)
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
      buildV4(
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
            .readFileSync(`${outputPath}${sep}reverse.txt`)
            .toString()

          expect(err).toBe(null)
          expect(additionalFile).not.toBe(null)
          expect(additionalFile).toMatchSnapshot()

          done()
        }
      )
    })

    test('has compilation error on invalid configuration', done => {
      buildV4(
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
      buildV4(
        new WebpackLicensePlugin({
          unacceptableLicenseTest: license => ['MIT'].includes(license),
        }),
        fileSystem,
        (err, stats) => {
          expect(err).toBe(null)
          expect(stats.errors).toEqual(
            expect.arrayContaining([
              'WebpackLicensePlugin: found unacceptable license "MIT" for react@16.6.3',
            ])
          )

          done()
        }
      )
    })
  })

  describe('webpack v3', () => {
    let fileSystem

    beforeEach(() => {
      fileSystem = new MemoryFs()
    })

    test('output matches snapshot', done => {
      buildV3(
        new WebpackLicensePlugin({
          licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache-2.0' },
        }),
        fileSystem,
        (err, stats) => {
          const output = JSON.parse(
            fileSystem
              .readFileSync(`${outputPath}${sep}oss-licenses.json`)
              .toString()
          )
          console.log(output)

          expect(err).toBe(null)
          expect(output).not.toBe(null)
          expect(output).toMatchSnapshot()

          done()
        }
      )
    })

    test('output to a different outputFilename matches snapshot', done => {
      buildV3(
        new WebpackLicensePlugin({
          outputFilename: 'bill-of-materials.json',
        }),
        fileSystem,
        (err, stats) => {
          const output = JSON.parse(
            fileSystem
              .readFileSync(`${outputPath}${sep}bill-of-materials.json`)
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
      buildV3(
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
            .readFileSync(`${outputPath}${sep}reverse.txt`)
            .toString()

          expect(err).toBe(null)
          expect(additionalFile).not.toBe(null)
          expect(additionalFile).toMatchSnapshot()

          done()
        }
      )
    })

    test('has compilation error on invalid configuration', done => {
      buildV3(
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
      buildV3(
        new WebpackLicensePlugin({
          unacceptableLicenseTest: license => ['MIT'].includes(license),
        }),
        fileSystem,
        (err, stats) => {
          expect(err).toBe(null)
          expect(stats.errors).toEqual(
            expect.arrayContaining([
              'WebpackLicensePlugin: found unacceptable license "MIT" for object-assign@4.1.1',
            ])
          )

          done()
        }
      )
    })
  })
})
