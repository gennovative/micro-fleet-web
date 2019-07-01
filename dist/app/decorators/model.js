"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const param_decor_base_1 = require("./param-decor-base");
async function extractModel(req, options) {
    // const { ModelClass, isPartial, extractFn: modelPropFn, hasTenantId } = options
    // Guard.assertArgDefined('ModelClass', ModelClass)
    // Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator'])
    // const translator: ModelAutoMapper<any> = ModelClass['translator']
    // const func: Function = !translator
    //     ? (m: any) => m // Noop function
    //     : Boolean(isPartial)
    //         ? translator.partial
    //         : translator.whole
    // let rawModel: object
    // if (req.body && req.body.model) {
    //     rawModel = req.body.model
    // }
    // else if (typeof modelPropFn === 'function') {
    //     rawModel = modelPropFn(req)
    // }
    // else {
    //     throw new MinorException(
    // 'Request body must have property "model". Otherwise, you must provide "modelPropFn" in decorator option.')
    // }
    // if (hasTenantId && typeof rawModel === 'object') {
    //     (await extractTenantId(req))
    //         .map(val => rawModel['tenantId'] = val)
    // }
    // const resultModel = func.call(translator, rawModel)
    // return resultModel
    const { ModelClass, isPartial, extractFn } = options;
    if (!extractFn && req.body.model == null) {
        throw new common_1.MinorException('Request must have property "body.model". Otherwise, you must provide "extractFn" in decorator option.');
    }
    const rawModel = Boolean(extractFn) ? extractFn(req) : req.body.model;
    if (typeof rawModel === 'object' && ModelClass) {
        common_1.Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator']);
        const translator = ModelClass['translator'];
        const func = (!!isPartial) ? translator.partial : translator.whole;
        return func.call(translator, rawModel);
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