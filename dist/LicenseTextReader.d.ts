import WebpackFileSystem from './WebpackFileSystem';
/**
 *
 *
 * @todo read fallback licenses from directory
 * @todo read fallback licenses from spdx.org
 */
export default class LicenseTextReader {
    private fileSystem;
    constructor(fileSystem: WebpackFileSystem);
    readLicenseText(license: string, moduleDir: string): string | null;
    private getLicenseFilename;
    private readFile;
}
