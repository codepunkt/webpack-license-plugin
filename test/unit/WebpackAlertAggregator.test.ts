import WebpackAlertAggregator from '../../src/WebpackAlertAggregator'
import webpack = require('webpack')

const MockCompilation = jest.fn<webpack.Compilation, any[]>((i) => i)

describe('WebpackAlertAggregator', () => {
  test('stores errors and flushes previously added errors', () => {
    const compilation = new MockCompilation({ errors: [], warnings: [] })
    const instance = new WebpackAlertAggregator(compilation)
    const prefix = 'WebpackLicensePlugin'

    instance.addError('foo')
    instance.addError('bar')
    instance.flushAlerts(prefix)
    instance.flushAlerts(prefix)

    expect(compilation.errors).toEqual([
      new webpack.WebpackError(`${prefix}: foo`),
      new webpack.WebpackError(`${prefix}: bar`),
    ])
  })

  test('stores warnings and flushes previously added warnings', () => {
    const compilation = new MockCompilation({ errors: [], warnings: [] })
    const instance = new WebpackAlertAggregator(compilation)
    const prefix = 'WebpackLicensePlugin'

    instance.addWarning('foo')
    instance.addWarning('bar')
    instance.flushAlerts(prefix)
    instance.flushAlerts(prefix)

    expect(compilation.warnings).toEqual([
      new webpack.WebpackError(`${prefix}: foo`),
      new webpack.WebpackError(`${prefix}: bar`),
    ])
  })
})
