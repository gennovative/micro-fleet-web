"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="reflect-metadata" />
const common_1 = require("@micro-fleet/common");
const MetaData_1 = require("../constants/MetaData");
/**
 * This is the meta key that TypeScript automatically decorates.
 */
const PARAM_TYPE_META = 'design:paramtypes';
/**
 * Stored the `resolverFn` for later use to resolve value for
 * param `paramIndex` of the `method` of `TargetClass`.
 */
function decorateParam(opts) {
    common_1.Guard.assertIsTruthy(opts.method, 'This decorator is for action method inside controller class');
    const args = [MetaData_1.MetaData.PARAM_DECOR, opts.TargetClass, opts.method];
    let paramDesc;
    if (Reflect.hasOwnMetadata.apply(Reflect, args)) {
        paramDesc = Reflect.getOwnMetadata.apply(Reflect, args);
    }
    else {
        paramDesc = [];
    }
    paramDesc[opts.paramIndex] = opts.resolverFn;
    Reflect.defineMetadata(MetaData_1.MetaData.PARAM_DECOR, paramDesc, opts.TargetClass, opts.method);
}
exports.decorateParam = decorateParam;
function getParamType(proto, method, paramIndex) {
    // Expected: ===========================v
    // __metadata("design:paramtypes", [Number, String, Object]),
    const paramTypes = Reflect.getOwnMetadata(PARAM_TYPE_META, proto, method) || [];
    return paramTypes[paramIndex];
}
exports.getParamType = getParamType;
function identity(val) {
    return val;
}
exports.identity = identity;
function primitiveParserFactory(proto, method, paramIndex) {
    const targetType = getParamType(proto, method, paramIndex);
    switch (targetType) {
        case Number:
            // Number(rawModel) is a valid casting
            return targetType;
        case Boolean:
            return function (rawModel) {
                if (!rawModel || rawModel === 'false' || rawModel === '0') {
                    return false;
                }
                return true;
            };
        case Object:
            return function (rawModel) {
                if (typeof rawModel === 'string') {
                    return JSON.parse(rawModel);
                }
                return Object(rawModel);
            };
        default:
            return identity;
    }
}
exports.primitiveParserFactory = primitiveParserFactory;
//# sourceMappingURL=param-decor-base.js.map