"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
function getHeader(req, name, parseFn, listDelimiter) {
    const parseItem = (r) => parseFn ? parseFn(r) : r;
    const raw = req.header(name);
    if (Array.isArray(raw)) {
        return raw.map(parseItem);
    }
    else if (listDelimiter) {
        return raw.split(listDelimiter).map(parseItem);
    }
    return parseItem(raw);
}
exports.getHeader = getHeader;
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.params`.
 * @param {string} name Case-insensitive header name
 * @param {ParseFunction} parseFn Function to parse the value or array item
 * @param {string} listDelimiter If provided, use this as delimiter to split
 *      the value to array or strings.
 */
function header(name, parseFn, listDelimiter) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getHeader(request, name, parseFn, listDelimiter),
        });
        return proto;
    };
}
exports.header = header;
//# sourceMappingURL=header.js.map