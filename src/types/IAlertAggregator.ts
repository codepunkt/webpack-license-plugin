export default interface IAlertAggregator {
  addError: (message: string) => any
  addWarning: (message: string) => any
  flushAlerts: (prefix: string) => void
}
