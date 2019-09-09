"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with selected property from `request.extras`.
 *
 * @param {string} name A key whose value will be extracted from `request.extras`.
 *     If not specified, the whole object will be returned, equivalent to `request.extras`.
 */
function extras(name) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? getExtras(name) : allExtras,
        });
    };
}
exports.extras = extras;
function getExtras(name) {
    return function (req) {
        return req.extras[name];
    };
}
function allExtras(req) {
    return req.extras;
}
//# sourceMappingURL=extras.js.map