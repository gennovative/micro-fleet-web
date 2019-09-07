"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getExtras(req, name) {
    if (!name) {
        return req.extras;
    }
    return req.extras[name];
}
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
            resolverFn: (request) => getExtras(request, name),
        });
    };
}
exports.extras = extras;
//# sourceMappingURL=extras.js.map