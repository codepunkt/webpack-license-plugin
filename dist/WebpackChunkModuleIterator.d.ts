import * as webpack from 'webpack';
import IWebpackChunkModule from './types/IWebpackChunkModule';
declare type Chunk = webpack.compilation.Chunk & {
    forEachModule?: (callback: (module: IWebpackChunkModule) => void) => void;
    modules?: IWebpackChunkModule[];
};
export default class WebpackChunkModuleIterator {
    iterateModules(chunk: Chunk, callback: (module: IWebpackChunkModule) => void): void;
}
export {};
