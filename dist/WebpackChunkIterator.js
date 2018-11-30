"use strict";
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
var get_npm_tarball_url_1 = require("get-npm-tarball-url");
var lodash_1 = require("lodash");
var LicenseIdentifier_1 = require("./LicenseIdentifier");
var LicenseTextReader_1 = require("./LicenseTextReader");
var ModuleDirectoryLocator_1 = require("./ModuleDirectoryLocator");
var WebpackChunkModuleIterator_1 = require("./WebpackChunkModuleIterator");
var WebpackModuleFileIterator_1 = require("./WebpackModuleFileIterator");
var WebpackChunkIterator = /** @class */ (function () {
    function WebpackChunkIterator(fileSystem, buildRoot, moduleIterator, fileIterator, moduleDirectoryLocator, licenseIdentifier, licenseTextReader) {
        if (moduleIterator === void 0) { moduleIterator = new WebpackChunkModuleIterator_1.default(); }
        if (fileIterator === void 0) { fileIterator = new WebpackModuleFileIterator_1.default(); }
        if (moduleDirectoryLocator === void 0) { moduleDirectoryLocator = new ModuleDirectoryLocator_1.default(fileSystem, buildRoot); }
        if (licenseIdentifier === void 0) { licenseIdentifier = new LicenseIdentifier_1.default([]); }
        if (licenseTextReader === void 0) { licenseTextReader = new LicenseTextReader_1.default(fileSystem); }
        this.fileSystem = fileSystem;
        this.moduleIterator = moduleIterator;
        this.fileIterator = fileIterator;
        this.moduleDirectoryLocator = moduleDirectoryLocator;
        this.licenseIdentifier = licenseIdentifier;
        this.licenseTextReader = licenseTextReader;
    }
    WebpackChunkIterator.prototype.iterateChunks = function (compilation, chunks, options) {
        var _this = this;
        var e_1, _a, e_2, _b;
        var moduleDirs = [];
        try {
            for (var chunks_1 = __values(chunks), chunks_1_1 = chunks_1.next(); !chunks_1_1.done; chunks_1_1 = chunks_1.next()) {
                var chunk = chunks_1_1.value;
                this.moduleIterator.iterateModules(chunk, function (module) {
                    _this.fileIterator.iterateFiles(module, function (filename) {
                        moduleDirs.push(_this.moduleDirectoryLocator.getModuleDir(filename));
                    });
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (chunks_1_1 && !chunks_1_1.done && (_a = chunks_1.return)) _a.call(chunks_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var licenseInfo = lodash_1.uniq(lodash_1.compact(moduleDirs)).map(function (moduleDir) {
            var packageJson = JSON.parse(_this.fileSystem.readFile(_this.fileSystem.join(moduleDir, 'package.json')));
            var license = _this.licenseIdentifier.identifyLicense(packageJson, options);
            if (options.unacceptableLicenseTest(license)) {
                var packageIdentifier = packageJson.name + "@" + packageJson.version;
                compilation.errors.push(new Error("WebpackLicensePlugin: found unacceptable license \"" + license + "\" for " + packageIdentifier));
            }
            var licenseText = _this.licenseTextReader.readLicenseText(license, moduleDir);
            return {
                name: packageJson.name,
                version: packageJson.version,
                author: typeof packageJson.author === 'object'
                    ? "" + packageJson.author.name + (packageJson.author.email ? " <" + packageJson.author.email + ">" : '') + (packageJson.author.url ? " (" + packageJson.author.url + ")" : '')
                    : packageJson.author,
                repository: packageJson.repository && packageJson.repository.url
                    ? packageJson.repository.url
                        .replace('git+ssh://git@', 'git://')
                        .replace('git+https://github.com', 'https://github.com')
                        .replace('git://github.com', 'https://github.com')
                        .replace('git@github.com:', 'https://github.com/')
                        .replace(/\.git$/, '')
                    : null,
                source: get_npm_tarball_url_1.default(packageJson.name, packageJson.version),
                license: license,
                licenseText: licenseText,
            };
        });
        var licenseInfoString = JSON.stringify(licenseInfo, null, 2);
        var addFile = function (filename, contents) {
            compilation.assets[filename] = {
                source: function () { return contents; },
                size: function () { return contents.length; },
            };
        };
        addFile(options.outputFilename, options.outputTransform(licenseInfoString));
        try {
            for (var _c = __values(Object.keys(options.additionalFiles)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var filename = _d.value;
                addFile(filename, options.additionalFiles[filename](licenseInfoString));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    return WebpackChunkIterator;
}());
exports.default = WebpackChunkIterator;
//# sourceMappingURL=WebpackChunkIterator.js.map