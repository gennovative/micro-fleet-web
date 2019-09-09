"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.headers`.
 * @param {string} name Case-insensitive header name.
 *    If not specified, the deserialized headers object will be returned, equivalent to `request.headers`.
 * @param {ParseFunction} parseFn Function to parse the value or array items.
 *    If not given, a default function will attempt to parse based on param type.
 *    This parameter is ignored if `name` is not specified.
 * @param {string} listDelimiter If provided, use this as delimiter to split the value to array or strings.
 *     This parameter is ignored if `name` is not specified.
 */
function header(name, parseFn, listDelimiter) {
    return function (proto, method, paramIndex) {
        function resolverFn(request) {
            parseFn = parseFn || param_decor_base_1.primitiveParserFactory(proto, method, paramIndex);
            return getHeader(request, name, parseFn, listDelimiter);
        }
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? resolverFn : allHeaders,
        });
    };
}
exports.header = header;
function getHeader(req, name, parse, listDelimiter) {
    const raw = req.header(name);
    if (Array.isArray(raw)) {
        return raw.map(parse);
    }
    else if (listDelimiter) {
        return raw.split(listDelimiter).map(parse);
    }
    return parse(raw);
}
function allHeaders(req) {
    return req.headers;
}
//# sourceMappingURL=header.js.map