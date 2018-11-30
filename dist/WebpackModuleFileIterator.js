"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebpackModuleFileIterator = /** @class */ (function () {
    function WebpackModuleFileIterator() {
    }
    WebpackModuleFileIterator.prototype.iterateFiles = function (module, callback) {
        if (module.resource) {
            callback(module.resource);
        }
        else if (module.rootModule && module.rootModule.resource) {
            callback(module.rootModule.resource);
        }
        if (module.fileDependencies) {
            module.fileDependencies.forEach(callback);
        }
        if (module.dependencies) {
            module.dependencies.forEach(function (dep) {
                if (dep.originModule && dep.originModule.resource) {
                    callback(dep.originModule.resource);
                }
            });
        }
    };
    return WebpackModuleFileIterator;
}());
exports.default = WebpackModuleFileIterator;
//# sourceMappingURL=WebpackModuleFileIterator.js.map