"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var ModuleDirectoryLocator = /** @class */ (function () {
    function ModuleDirectoryLocator(fileSystem, buildRoot) {
        this.fileSystem = fileSystem;
        this.buildRoot = buildRoot;
    }
    ModuleDirectoryLocator.prototype.getModuleDir = function (filename) {
        var moduleDir = filename.substring(0, filename.lastIndexOf(path_1.sep));
        var prevModuleDir = null;
        while (!this.fileSystem.pathExists(this.fileSystem.join(moduleDir, 'package.json'))) {
            // check parent directory
            prevModuleDir = moduleDir;
            moduleDir = this.fileSystem.resolve("" + moduleDir + path_1.sep + ".." + path_1.sep);
            // reached filesystem root
            if (prevModuleDir === moduleDir) {
                // @todo file does not belong to a module. throw?
                return null;
            }
        }
        if (this.buildRoot === moduleDir) {
            return null;
        }
        return moduleDir;
    };
    return ModuleDirectoryLocator;
}());
exports.default = ModuleDirectoryLocator;
//# sourceMappingURL=ModuleDirectoryLocator.js.map