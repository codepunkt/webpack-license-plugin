import * as webpack from 'webpack';
import { IWebpackLicensePluginOptions } from './PluginOptionsProvider';
import IWebpackPlugin from './types/IWebpackPlugin';
export default class WebpackLicensePlugin implements IWebpackPlugin {
    private pluginOptions;
    constructor(pluginOptions?: IWebpackLicensePluginOptions);
    apply(compiler: webpack.Compiler): void;
}
export { WebpackLicensePlugin };
