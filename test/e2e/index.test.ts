import MemoryFs = require('memory-fs')
import { resolve, sep } from 'path'
import * as webpack4 from 'webpack'
import * as webpack2 from 'webpack2'
import * as webpack3 from 'webpack3'
// @ts-ignore
import * as webpack5 from 'webpack5'
import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'

const outputPath = resolve(__dirname, './example/dist')

const createBuild = (wp: (options: object) => webpack4.Compiler) => (
  plugin: WebpackLicensePlugin,
  fileSystem: MemoryFs,
  callback: (err: Error, stats: any) => void
) => {
  const compiler = wp({
    entry: resolve(__dirname, './example/src/index.js'),
    output: { path: outputPath },
    target: 'web',
    plugins: [plugin],
  })

  compiler.outputFileSystem = fileSystem
  compiler.run((err, stats) => callback(err, stats.toJson()))
}

const webpackVersions = [
  { description: 'webpack v2', fn: webpack2 },
  { description: 'webpack v3', fn: webpack3 },
  { description: 'webpack v4', fn: webpack4 },
  { description: 'webpack v5', fn: webpack5 },
]

describe('end to end', () => {
  webpackVersions.forEach(webpackVersion => {
    const buildErrors = (
      messages: string[]
    ): string[] | { message: string }[] => {
      return webpackVersion.description === 'webpack v5'
        ? messages.map(message => ({ message }))
        : messages
    }

    describe(webpackVersion.description, () => {
      const build = createBuild(webpackVersion.fn)
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
                .readFileSync(`${outputPath}${sep}oss-licenses.json`)
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
        build(
          new WebpackLicensePlugin({
            additionalFiles: {
              'oss-reverse.json': packages =>
                JSON.stringify(packages.reverse()),
            },
          }),
          fileSystem,
          (err, stats) => {
            const additionalFile = fileSystem
              .readFileSync(`${outputPath}${sep}oss-reverse.json`)
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
            expect(stats.errors).toEqual(
              buildErrors([
                'WebpackLicensePlugin: Invalid licenseOverrides option: "Apache 2.0" is not a valid SPDX expression!',
              ])
            )

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
              expect.arrayContaining(
                buildErrors([
                  'WebpackLicensePlugin: Found unacceptable license "MIT" for react@16.6.3',
                  'WebpackLicensePlugin: Found unacceptable license "MIT" for react-dom@16.6.3',
                ]) as string[]
              )
            )

            done()
          }
        )
      })

      test('output matches snapshot when packages have been excluded', done => {
        build(
          new WebpackLicensePlugin({
            excludedPackageTest: (packageName, version) =>
              packageName === 'react',
          }),
          fileSystem,
          (err, stats) => {
            const output = JSON.parse(
              fileSystem
                .readFileSync(`${outputPath}${sep}oss-licenses.json`)
                .toString()
            )

            expect(err).toBe(null)
            expect(output).not.toBe(null)
            expect(output).toMatchSnapshot()

            done()
          }
        )
      })

      test('output matches snapshot when packages have been included', done => {
        build(
          new WebpackLicensePlugin({
            includePackages: () => [
              resolve(__dirname, '../../node_modules/jest')
            ]
          }),
          fileSystem,
          (err, stats) => {
            const output = JSON.parse(
              fileSystem
                .readFileSync(`${outputPath}${sep}oss-licenses.json`)
                .toString()
            )

            expect(err).toBe(null)
            expect(output).not.toBe(null)
            expect(output).toMatchSnapshot()

            done()
          }
        )
      })

      test('output matches snapshot when a package has been manually included that is also included in the build result', done => {
        build(
          new WebpackLicensePlugin({
            includePackages: () => [
              resolve(__dirname, 'example/node_modules/react')
            ]
          }),
          fileSystem,
          (err, stats) => {
            const output = JSON.parse(
              fileSystem
                .readFileSync(`${outputPath}${sep}oss-licenses.json`)
                .toString()
            )

            expect(err).toBe(null)
            expect(output).not.toBe(null)
            expect(output).toMatchSnapshot()

            done()
          }
        )
      })
    })
  })
})
