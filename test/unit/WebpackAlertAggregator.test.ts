import WebpackAlertAggregator from '../../src/WebpackAlertAggregator'
import webpack = require('webpack')

const MockCompilation = jest.fn<webpack.compilation.Compilation>(i => i)

describe('WebpackAlertAggregator', () => {
  test('stores errors and flushes previously added errors', () => {
    const compilation = new MockCompilation({ errors: [], warnings: [] })
    const instance = new WebpackAlertAggregator(compilation)

    instance.addError('foo')
    instance.addError('bar')
    instance.flushAlerts()
    instance.flushAlerts()

    expect(compilation.errors).toEqual(['foo', 'bar'])
  })

  test('stores warnings and flushes previously added warnings', () => {
    const compilation = new MockCompilation({ errors: [], warnings: [] })
    const instance = new WebpackAlertAggregator(compilation)

    instance.addWarning('foo')
    instance.addWarning('bar')
    instance.flushAlerts()
    instance.flushAlerts()

    expect(compilation.warnings).toEqual(['foo', 'bar'])
  })
})
