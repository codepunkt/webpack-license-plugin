"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PluginOptionsProvider_1 = require("./PluginOptionsProvider");
var WebpackChunkIterator_1 = require("./WebpackChunkIterator");
var WebpackFileSystem_1 = require("./WebpackFileSystem");
var WebpackLicensePlugin = /** @class */ (function () {
    function WebpackLicensePlugin(pluginOptions) {
        if (pluginOptions === void 0) { pluginOptions = {}; }
        this.pluginOptions = pluginOptions;
    }
    // @todo "emit" vs "compilation" & "optimizeChunkAssets" hooks
    WebpackLicensePlugin.prototype.apply = function (compiler) {
        var _this = this;
        var fileSystem = new WebpackFileSystem_1.default(compiler.inputFileSystem);
        var buildRoot = compiler.options.context;
        var chunkIterator = new WebpackChunkIterator_1.default(fileSystem, buildRoot);
        if (typeof compiler.hooks !== 'undefined') {
            compiler.hooks.compilation.tap('webpack-license-plugin', function (compilation) {
                var optionsProvider = new PluginOptionsProvider_1.default(compilation);
                var options = optionsProvider.getOptions(_this.pluginOptions);
                compilation.hooks.optimizeChunkAssets.tap('LicenseWebpackPlugin', function (chunks) {
                    chunkIterator.iterateChunks(compilation, chunks, options);
                });
            });
        }
        else if (typeof compiler.plugin !== 'undefined') {
            compiler.plugin('compilation', function (compilation) {
                if (typeof compilation.plugin !== 'undefined') {
                    var optionsProvider = new PluginOptionsProvider_1.default(compilation);
                    var options_1 = optionsProvider.getOptions(_this.pluginOptions);
                    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
                        chunkIterator.iterateChunks(compilation, chunks, options_1);
                        callback();
                    });
                }
            });
        }
    };
    return WebpackLicensePlugin;
}());
exports.WebpackLicensePlugin = WebpackLicensePlugin;
exports.default = WebpackLicensePlugin;
//# sourceMappingURL=WebpackLicensePlugin.js.map