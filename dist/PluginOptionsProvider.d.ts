import * as webpack from 'webpack';
export interface IWebpackLicensePluginOptions {
    additionalFiles?: {
        [filename: string]: (output: string) => string;
    };
    licenseOverrides?: {
        [packageVersion: string]: string;
    };
    outputFilename?: string;
    outputTransform?: (output: string) => string;
    unacceptableLicenseTest?: (license: string) => boolean;
}
export default class PluginOptionsProvider {
    private compilation;
    private defaultOptions;
    constructor(compilation: webpack.compilation.Compilation);
    getOptions(pluginOptions: IWebpackLicensePluginOptions): IWebpackLicensePluginOptions;
    private validateOptions;
}
