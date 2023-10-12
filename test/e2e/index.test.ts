import { resolve, sep } from 'node:path'
import { fs } from 'memfs'
import * as webpack from 'webpack'
import WebpackLicensePlugin from '../../src/WebpackLicensePlugin'

const outputPath = resolve(__dirname, './example/dist')

describe('end to end', () => {
  const buildErrors = (
    messages: string[]
  ): string[] | { message: string }[] => {
    return messages.map((message) => expect.objectContaining({ message }))
  }

  const build = (
    plugin: WebpackLicensePlugin,
    callback: (err?: Error | null, stats?: any) => void
  ) => {
    const compiler = webpack({
      entry: resolve(__dirname, './example/src/index.js'),
      output: { path: outputPath },
      target: 'web',
      plugins: [plugin],
    })

    compiler.outputFileSystem = fs
    compiler.run((err, stats) => callback(err, stats?.toJson()))
  }

  test('output matches snapshot', (done) => {
    build(
      new WebpackLicensePlugin({
        licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache-2.0' },
      }),
      (err) => {
        const output = JSON.parse(
          fs.readFileSync(`${outputPath}${sep}oss-licenses.json`).toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })

  test('output to a different outputFilename matches snapshot', (done) => {
    build(
      new WebpackLicensePlugin({
        outputFilename: 'bill-of-materials.json',
      }),
      (err) => {
        const output = JSON.parse(
          fs
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

  test('additionalFiles match snapshot', (done) => {
    build(
      new WebpackLicensePlugin({
        additionalFiles: {
          'oss-reverse.json': (packages) => JSON.stringify(packages.reverse()),
        },
      }),
      (err) => {
        const additionalFile = fs
          .readFileSync(`${outputPath}${sep}oss-reverse.json`)
          .toString()

        expect(err).toBe(null)
        expect(additionalFile).not.toBe(null)
        expect(additionalFile).toMatchSnapshot()

        done()
      }
    )
  })

  test('has compilation error on invalid configuration', (done) => {
    build(
      new WebpackLicensePlugin({
        licenseOverrides: { 'spdx-expression-parse@1.0.4': 'Apache 2.0' },
      }),
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

  test('has compilation error when encountering unacceptable licenses', (done) => {
    build(
      new WebpackLicensePlugin({
        unacceptableLicenseTest: (license) => ['MIT'].includes(license),
      }),
      (err, stats) => {
        expect(err).toBe(null)
        expect(stats.errors).toEqual(
          expect.arrayContaining<string | { message: string }>(
            buildErrors([
              'WebpackLicensePlugin: Found unacceptable license "MIT" for react@18.2.0',
              'WebpackLicensePlugin: Found unacceptable license "MIT" for react-dom@18.2.0',
            ])
          )
        )

        done()
      }
    )
  })

  test('output matches snapshot when packages have been excluded', (done) => {
    build(
      new WebpackLicensePlugin({
        excludedPackageTest: (packageName) => packageName === 'react',
      }),
      (err) => {
        const output = JSON.parse(
          fs.readFileSync(`${outputPath}${sep}oss-licenses.json`).toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })

  test('output matches snapshot when packages have been included', (done) => {
    build(
      new WebpackLicensePlugin({
        includePackages: () => [resolve(__dirname, '../../node_modules/jest')],
      }),
      (err) => {
        const output = JSON.parse(
          fs.readFileSync(`${outputPath}${sep}oss-licenses.json`).toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })

  test('output matches snapshot when a package has been manually included that is also included in the build result', (done) => {
    build(
      new WebpackLicensePlugin({
        includePackages: () => [
          resolve(__dirname, 'example/node_modules/react'),
        ],
      }),
      (err) => {
        const output = JSON.parse(
          fs.readFileSync(`${outputPath}${sep}oss-licenses.json`).toString()
        )

        expect(err).toBe(null)
        expect(output).not.toBe(null)
        expect(output).toMatchSnapshot()

        done()
      }
    )
  })
})
