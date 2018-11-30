"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var validate = require("spdx-expression-validate");
var PluginOptionsProvider = /** @class */ (function () {
    function PluginOptionsProvider(compilation) {
        this.compilation = compilation;
        this.defaultOptions = {
            additionalFiles: {},
            licenseOverrides: {},
            outputFilename: 'oss-licenses.json',
            outputTransform: function (a) { return a; },
            unacceptableLicenseTest: function () { return false; },
        };
    }
    PluginOptionsProvider.prototype.getOptions = function (pluginOptions) {
        this.validateOptions(pluginOptions);
        var options = __assign({}, this.defaultOptions, pluginOptions);
        return options;
    };
    PluginOptionsProvider.prototype.validateOptions = function (pluginOptions) {
        var e_1, _a;
        if (pluginOptions.licenseOverrides) {
            try {
                for (var _b = __values(Object.keys(pluginOptions.licenseOverrides)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var packageVersion = _c.value;
                    if (!validate(pluginOptions.licenseOverrides[packageVersion])) {
                        this.compilation.errors.push(new Error("WebpackLicensePlugin: \"" + pluginOptions.licenseOverrides[packageVersion] + "\" in licenseOverrides option is not a valid SPDX expression!"));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    return PluginOptionsProvider;
}());
exports.default = PluginOptionsProvider;
//# sourceMappingURL=PluginOptionsProvider.js.map