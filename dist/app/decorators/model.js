"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const param_decor_base_1 = require("./param-decor-base");
const tenantId_1 = require("./tenantId");
async function extractModel(req, options) {
    const { ModelClass, isPartial, modelPropFn, hasTenantId } = options;
    common_1.Guard.assertArgDefined('ModelClass', ModelClass);
    common_1.Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator']);
    const translator = ModelClass['translator'];
    const func = !translator
        ? (m) => m // Noop function
        : Boolean(isPartial)
            ? translator.partial
            : translator.whole;
    let rawModel;
    if (req.body && req.body.model) {
        rawModel = req.body.model;
    }
    else if (typeof modelPropFn === 'function') {
        rawModel = modelPropFn(req);
    }
    else {
        throw new common_1.MinorException('Request body must have property "model". Otherwise, you must provide "modelPropFn" in decorator option.');
    }
    if (hasTenantId && typeof rawModel === 'object') {
        (await tenantId_1.extractTenantId(req))
            .map(val => rawModel['tenantId'] = val);
    }
    const resultModel = func.call(translator, rawModel);
    return resultModel;
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