"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getRouteParam(req, name, parseFn) {
    return parseFn ? parseFn(req.params[name]) : req.params[name];
}
exports.getRouteParam = getRouteParam;
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with a route params from `request.params`.
 */
function param(name, parseFn) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getRouteParam(request, name, parseFn),
        });
        return proto;
    };
}
exports.param = param;
//# sourceMappingURL=param.js.map