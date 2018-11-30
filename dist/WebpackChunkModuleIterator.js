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
var WebpackChunkModuleIterator = /** @class */ (function () {
    function WebpackChunkModuleIterator() {
    }
    WebpackChunkModuleIterator.prototype.iterateModules = function (chunk, callback) {
        var e_1, _a;
        if (typeof chunk.modulesIterable !== 'undefined') {
            try {
                for (var _b = __values(chunk.modulesIterable), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var module_1 = _c.value;
                    callback(module_1);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // } else if (typeof chunk.getModules === 'function') {
            //   chunk.getModules().forEach(callback)
        }
        else if (typeof chunk.forEachModule === 'function') {
            chunk.forEachModule(callback);
        }
        else if (Array.isArray(chunk.modules)) {
            chunk.modules.forEach(callback);
        }
        if (chunk.entryModule) {
            callback(chunk.entryModule);
        }
    };
    return WebpackChunkModuleIterator;
}());
exports.default = WebpackChunkModuleIterator;
//# sourceMappingURL=WebpackChunkModuleIterator.js.map