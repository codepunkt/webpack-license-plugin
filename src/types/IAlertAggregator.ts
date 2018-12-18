export default interface IAlertAggregator {
  addError(message: string)
  addWarning(message: string)
  flushAlerts(): void
}
