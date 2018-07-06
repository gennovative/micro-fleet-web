"use strict";
// Empty operation name => must login
// Non-empty op name => check op's conditions => must or no need to login
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="reflect-metadata" />
const AuthorizeFilter_1 = require("../filters/AuthorizeFilter");
const filter_1 = require("./filter");
/**
 * Marks a controller or action to require auth token to be accessible.
 */
function authorized() {
    return function (TargetClass, key) {
        TargetClass = filter_1.addFilterToTarget(AuthorizeFilter_1.AuthorizeFilter, TargetClass, key, filter_1.FilterPriority.HIGH);
        return TargetClass;
    };
}
exports.authorized = authorized;
//# sourceMappingURL=authorized.js.map