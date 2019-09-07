"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
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
exports.getHeader = getHeader;
/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.params`.
 * @param {string} name Case-insensitive header name
 * @param {ParseFunction} parseFn Function to parse the value or array item.
 *    If not given, a default function will attempt to parse based on param type.
 * @param {string} listDelimiter If provided, use this as delimiter to split
 *      the value to array or strings.
 */
function header(name, parseFn, listDelimiter) {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => {
                return getHeader(request, name, parseFn || param_decor_base_1.primitiveParserFactory(proto, method, paramIndex), listDelimiter);
            },
        });
    };
}
exports.header = header;
//# sourceMappingURL=header.js.map