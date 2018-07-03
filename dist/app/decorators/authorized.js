"use strict";
// Empty operation name => must login
// Non-empty op name => check op's conditions => must or no need to login
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="reflect-metadata" />
const AuthorizeFilter_1 = require("../filters/AuthorizeFilter");
const filter_1 = require("./filter");
/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function authorized() {
    return function (TargetClass, key) {
        // const isMethodScope: boolean = !!key; // If `key` has value, `TargetClass` is "prototype" object, otherwise it's a class.
        // if (isMethodScope) {
        // }
        TargetClass = filter_1.addFilterToTarget(AuthorizeFilter_1.AuthorizeFilter, TargetClass, key, 9);
        return TargetClass;
    };
}
exports.authorized = authorized;
//# sourceMappingURL=authorized.js.map