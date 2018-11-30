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
/**
 *
 *
 * @todo read fallback licenses from directory
 * @todo read fallback licenses from spdx.org
 */
var LicenseTextReader = /** @class */ (function () {
    function LicenseTextReader(fileSystem) {
        this.fileSystem = fileSystem;
    }
    LicenseTextReader.prototype.readLicenseText = function (license, moduleDir) {
        if (license.indexOf('SEE LICENSE IN ') === 0) {
            var filename = license.split(' ')[3];
            return this.readFile(moduleDir, filename);
        }
        var pathsInModuleDir = this.fileSystem.listPaths(moduleDir);
        var licenseFilename = this.getLicenseFilename(pathsInModuleDir);
        if (licenseFilename !== null) {
            return this.readFile(moduleDir, licenseFilename);
        }
        return null;
    };
    LicenseTextReader.prototype.getLicenseFilename = function (paths) {
        var e_1, _a;
        try {
            for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                var path = paths_1_1.value;
                if (/^licen[cs]e/i.test(path)) {
                    return path;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    LicenseTextReader.prototype.readFile = function (directory, filename) {
        return this.fileSystem
            .readFile(this.fileSystem.join(directory, filename))
            .replace(/\r\n/g, '\n');
    };
    return LicenseTextReader;
}());
exports.default = LicenseTextReader;
//# sourceMappingURL=LicenseTextReader.js.map