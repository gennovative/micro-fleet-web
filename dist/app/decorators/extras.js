"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getExtras(req, name, parseFn) {
    if (!name) {
        return req.params;
    }
    return parseFn ? parseFn(req.params[name]) : req.params[name];
}
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with selected property from `request.extras`.
 */
function extras(name, parseFn) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getExtras(request, name, parseFn),
        });
        return proto;
    };
}
exports.extras = extras;
//# sourceMappingURL=extras.js.map