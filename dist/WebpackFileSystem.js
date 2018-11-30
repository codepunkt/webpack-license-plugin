"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var WebpackFileSystem = /** @class */ (function () {
    function WebpackFileSystem(fs) {
        this.fs = fs;
    }
    WebpackFileSystem.prototype.isFileInDirectory = function (filename, directory) {
        var normalizedFile = this.resolve(filename);
        var normalizedDirectory = this.resolve(directory);
        return normalizedFile.indexOf(normalizedDirectory) === 0;
    };
    WebpackFileSystem.prototype.pathExists = function (filename) {
        try {
            this.fs.statSync(filename);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    WebpackFileSystem.prototype.readFile = function (filename) {
        return this.fs.readFileSync(filename).toString('utf8');
    };
    WebpackFileSystem.prototype.join = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i] = arguments[_i];
        }
        return path_1.join.apply(void 0, __spread(paths));
    };
    WebpackFileSystem.prototype.resolve = function (pathInput) {
        return path_1.resolve(pathInput);
    };
    WebpackFileSystem.prototype.listPaths = function (dir) {
        return this.fs.readdirSync(dir);
    };
    return WebpackFileSystem;
}());
exports.default = WebpackFileSystem;
//# sourceMappingURL=WebpackFileSystem.js.map