import type * as webpack from 'webpack'

export default interface IWebpackPlugin {
  apply: (compiler: webpack.Compiler) => void
}
