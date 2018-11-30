import * as webpack from 'webpack';
import LicenseIdentifier from './LicenseIdentifier';
import LicenseTextReader from './LicenseTextReader';
import ModuleDirectoryLocator from './ModuleDirectoryLocator';
import { IWebpackLicensePluginOptions } from './PluginOptionsProvider';
import IWebpackChunkIterator from './types/IWebpackChunkIterator';
import WebpackChunkModuleIterator from './WebpackChunkModuleIterator';
import WebpackFileSystem from './WebpackFileSystem';
import WebpackModuleFileIterator from './WebpackModuleFileIterator';
export default class WebpackChunkIterator implements IWebpackChunkIterator {
    private fileSystem;
    private moduleIterator;
    private fileIterator;
    private moduleDirectoryLocator;
    private licenseIdentifier;
    private licenseTextReader;
    constructor(fileSystem: WebpackFileSystem, buildRoot: string, moduleIterator?: WebpackChunkModuleIterator, fileIterator?: WebpackModuleFileIterator, moduleDirectoryLocator?: ModuleDirectoryLocator, licenseIdentifier?: LicenseIdentifier, licenseTextReader?: LicenseTextReader);
    iterateChunks(compilation: webpack.compilation.Compilation, chunks: webpack.compilation.Chunk[], options: IWebpackLicensePluginOptions): void;
}
