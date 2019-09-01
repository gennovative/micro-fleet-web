"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const param_decor_base_1 = require("./param-decor-base");
async function extractModel(req, options) {
    const { ModelClass, isPartial, extractFn, hasTenantId } = options;
    const translateOpt = (options.enableValidation != null)
        ? { enableValidation: options.enableValidation }
        : null;
    if (!extractFn && req.body.model == null) {
        throw new common_1.MinorException('Request must have property "body.model". Otherwise, you must provide "extractFn" in decorator option.');
    }
    const rawModel = Boolean(extractFn) ? extractFn(req) : req.body.model;
    hasTenantId && (rawModel.tenantId = req.extras.tenantId);
    if (typeof rawModel === 'object' && ModelClass) {
        common_1.Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator']);
        const translator = ModelClass['translator'];
        const func = Boolean(isPartial) ? translator.partial : translator.whole;
        return func.call(translator, rawModel, translateOpt);
    }
    return rawModel;
}
exports.extractModel = extractModel;
/**
 * For action parameter decoration.
 * Attempts to translate request body to desired model class,
 * then attaches to the parameter's value.
 * @param opts Can be the Model Class or option object.
 */
function model(opts) {
    return function (proto, method, paramIndex) {
        if (typeof opts === 'function') {
            opts = {
                ModelClass: opts,
            };
        }
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => extractModel(request, opts),
        });
        return proto;
    };
}
exports.model = model;
//# sourceMappingURL=model.js.map