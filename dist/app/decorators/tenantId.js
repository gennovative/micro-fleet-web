"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const param_decor_base_1 = require("./param-decor-base");
/**
 * Attempts to get tenant ID from tenant slug in request params.
 */
async function extractTenantId(req) {
    if (req.extras.tenantId) {
        // If TenantResolverFilter is register as global filter
        return common_1.Maybe.Just(req.extras.tenantId);
    }
    const container = common_1.serviceContext.dependencyContainer;
    const tenantSvc = container.resolve('');
    const maybeId = await tenantSvc.getIdBySlug(req.params['tenant']);
    return maybeId;
}
exports.extractTenantId = extractTenantId;
/*
 * For action parameter decoration.
 * Will resolve the parameter's value with tenantId from request params.
 */
function tenantId() {
    return function (proto, method, paramIndex) {
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: extractTenantId,
        });
        return proto;
    };
}
exports.tenantId = tenantId;
//# sourceMappingURL=tenantId.js.map