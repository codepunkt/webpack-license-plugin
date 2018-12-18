import IAlertAggregator from './types/IAlertAggregator'
import webpack = require('webpack')

export default class WebpackAlertAggregator implements IAlertAggregator {
  private errors: string[] = []
  private warnings: string[] = []

  constructor(private readonly compilation: webpack.compilation.Compilation) {}

  public addError(message: string) {
    this.errors.push(message)
  }

  public addWarning(message: string) {
    this.warnings.push(message)
  }

  public flushAlerts(): void {
    this.compilation.errors.push(...this.errors)
    this.errors = []
    this.compilation.warnings.push(...this.warnings)
    this.warnings = []
  }
}
