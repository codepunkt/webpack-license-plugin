import IWebpackChunkModule from './types/IWebpackChunkModule';
export default class WebpackModuleFileIterator {
    iterateFiles(module: IWebpackChunkModule, callback: (filename: string) => void): void;
}
