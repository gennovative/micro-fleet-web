"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with a route params from `request.params`.
 *
 * @param {string} name A key whose value will be extracted from route params.
 *     If not specified, the deserialized params object will be returned, equivalent to `request.params`.
 * @param {Function} parseFn Function to parse extracted value to expected data type.
 *     This parameter is ignored if `name` is not specified.
 */
function param(name, parseFn) {
    return function (proto, method, paramIndex) {
        function resolverFn(request) {
            parseFn = parseFn || param_decor_base_1.primitiveParserFactory(proto, method, paramIndex);
            return parseFn(request.params[name]);
        }
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? resolverFn : req => req.params,
        });
    };
}
exports.param = param;
//# sourceMappingURL=param.js.map