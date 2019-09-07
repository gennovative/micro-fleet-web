"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getQueryString(req, name, parseFn) {
    const raw = req.query[name];
    if (Array.isArray(raw)) {
        return raw.map(parseFn);
    }
    return parseFn(raw);
}
/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with query string value from `request.query`.
 *
 * @param {string} name A key whose value will be extracted from query string.
 *     If not specified, the deserialized query object will be returned, equivalent to `request.query`.
 * @param {Function} parseFn Function to parse extracted value to expected data type.
 *     This parameter is ignored if `name` is not specified.
 */
function query(name, parseFn) {
    return function (proto, method, paramIndex) {
        function resolverFn(request) {
            parseFn = parseFn || param_decor_base_1.primitiveParserFactory(proto, method, paramIndex);
            return getQueryString(request, name, parseFn);
        }
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            // resolverFn: (request) => getQueryString(request, name, parseFn),
            resolverFn: Boolean(name) ? resolverFn : req => req.query,
        });
    };
}
exports.query = query;
//# sourceMappingURL=query.js.map