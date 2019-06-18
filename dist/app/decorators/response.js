"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const param_decor_base_1 = require("./param-decor-base");
/**
 * For action parameter decoration.
 * Resolves the parameter's value with the current response object
 */
function response() {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (req, res) => res,
        });
        return proto;
    };
}
exports.response = response;
//# sourceMappingURL=response.js.map