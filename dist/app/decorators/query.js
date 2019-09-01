"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getQueryString(req, name, parseFn) {
    const parseItem = (r) => parseFn ? parseFn(r) : r;
    const raw = req.query[name];
    if (Array.isArray(raw)) {
        return raw.map(parseItem);
    }
    return parseItem(raw);
}
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with query string value from `request.params`.
 */
function query(name, parseFn) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getQueryString(request, name, parseFn),
        });
        return proto;
    };
}
exports.query = query;
//# sourceMappingURL=query.js.map