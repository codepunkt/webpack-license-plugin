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
 * Identifies license type based on package.json and selects
 * preferred if multiple are found
 *
 * @todo handle "SEE LICENSE IN" `license` fields
 * @see https://docs.npmjs.com/files/package.json#license
 *
 * @todo handle spdx OR case
 *
 * @todo handle license ambiguity via option (default to choosing the first)
 */
var LicenseIdentifier = /** @class */ (function () {
    function LicenseIdentifier(preferredLicenseTypes) {
        this.preferredLicenseTypes = preferredLicenseTypes;
    }
    LicenseIdentifier.prototype.identifyLicense = function (packageJson, options) {
        var packageIdentifier = packageJson.name + "@" + packageJson.version;
        if (options.licenseOverrides[packageIdentifier]) {
            return options.licenseOverrides[packageIdentifier];
        }
        if (typeof packageJson.license === 'object') {
            return packageJson.license.type;
        }
        else if (packageJson.license) {
            return packageJson.license;
        }
        // handle deprecated `licenses` field
        if (Array.isArray(packageJson.licenses) &&
            packageJson.licenses.length > 0) {
            return (this.findPreferredLicense(packageJson.licenses.map(function (license) { return license.type; }), this.preferredLicenseTypes) || packageJson.licenses[0].type);
        }
        return null;
    };
    LicenseIdentifier.prototype.findPreferredLicense = function (licenseTypes, preferredLicenseTypes) {
        var e_1, _a, e_2, _b;
        try {
            for (var preferredLicenseTypes_1 = __values(preferredLicenseTypes), preferredLicenseTypes_1_1 = preferredLicenseTypes_1.next(); !preferredLicenseTypes_1_1.done; preferredLicenseTypes_1_1 = preferredLicenseTypes_1.next()) {
                var preferredLicenseType = preferredLicenseTypes_1_1.value;
                try {
                    for (var licenseTypes_1 = __values(licenseTypes), licenseTypes_1_1 = licenseTypes_1.next(); !licenseTypes_1_1.done; licenseTypes_1_1 = licenseTypes_1.next()) {
                        var licenseType = licenseTypes_1_1.value;
                        if (preferredLicenseType === licenseType) {
                            return preferredLicenseType;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (licenseTypes_1_1 && !licenseTypes_1_1.done && (_b = licenseTypes_1.return)) _b.call(licenseTypes_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (preferredLicenseTypes_1_1 && !preferredLicenseTypes_1_1.done && (_a = preferredLicenseTypes_1.return)) _a.call(preferredLicenseTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    return LicenseIdentifier;
}());
exports.default = LicenseIdentifier;
//# sourceMappingURL=LicenseIdentifier.js.map