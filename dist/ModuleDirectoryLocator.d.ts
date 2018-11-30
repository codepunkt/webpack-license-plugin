import WebpackFileSystem from './WebpackFileSystem';
export default class ModuleDirectoryLocator {
    private fileSystem;
    private buildRoot;
    constructor(fileSystem: WebpackFileSystem, buildRoot: string);
    getModuleDir(filename: string): string | null;
}
