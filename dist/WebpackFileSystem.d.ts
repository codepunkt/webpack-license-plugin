export default class WebpackFileSystem {
    private fs;
    constructor(fs: any);
    isFileInDirectory(filename: string, directory: string): boolean;
    pathExists(filename: string): boolean;
    readFile(filename: string): string;
    join(...paths: string[]): string;
    resolve(pathInput: string): string;
    listPaths(dir: string): string[];
}
