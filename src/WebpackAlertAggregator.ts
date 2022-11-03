import IAlertAggregator from './types/IAlertAggregator'
import webpack = require('webpack')

export default class WebpackAlertAggregator implements IAlertAggregator {
  private errors: string[] = []
  private warnings: string[] = []

  constructor(private readonly compilation: webpack.Compilation) {}

  public addError(message: string) {
    this.errors.push(message)
  }

  public addWarning(message: string) {
    this.warnings.push(message)
  }

  public flushAlerts(prefix: string): void {
    this.compilation.errors.push(
      ...this.errors.map((e) => new webpack.WebpackError(`${prefix}: ${e}`))
    )
    this.errors = []
    this.compilation.warnings.push(
      ...this.warnings.map((w) => new webpack.WebpackError(`${prefix}: ${w}`))
    )
    this.warnings = []
  }
}
