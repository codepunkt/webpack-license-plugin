import * as webpack from 'webpack';
import { IWebpackLicensePluginOptions } from '../PluginOptionsProvider';
export default interface IWebpackChunkIterator {
    iterateChunks(compilation: webpack.compilation.Compilation, chunks: webpack.compilation.Chunk[], options: IWebpackLicensePluginOptions): void;
}
