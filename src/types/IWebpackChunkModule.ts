export default interface IWebpackChunkModule {
  resource?: string
  rootModule?: { resource?: string }
  originModule?: { resource?: string }
  fileDependencies?: string[]
  dependencies?: IWebpackChunkModule[]
  _parentModule?: { resource?: string }
}
