"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const param_decor_base_1 = require("./param-decor-base");
/**
 * For action parameter decoration.
 * Attempts to translate request body to desired model class,
 * then attaches to the parameter's value.
 * @param opts Can be the Model Class or option object.
 */
function model(opts = {}) {
    return function (proto, method, paramIndex) {
        if (typeof opts === 'function') {
            opts = {
                ItemClass: opts,
            };
        }
        opts.extractFn = opts.extractFn || ((req) => req.body);
        opts.postProcessFn = opts.postProcessFn || param_decor_base_1.identity;
        let rsParser;
        param_decor_base_1.decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => {
                rsParser = rsParser || modelParserFactory(proto, method, paramIndex, opts);
                rsParser.throwError();
                return translateModel(request, opts, rsParser.value);
            },
        });
        return proto;
    };
}
exports.model = model;
async function translateModel(req, options, parse) {
    const { extractFn, postProcessFn } = options;
    const rawModel = extractFn(req);
    const resultModel = parse(rawModel);
    postProcessFn(resultModel, req);
    return resultModel;
}
/**
 * Selects a function to parse request body to model object.
 */
function modelParserFactory(proto, method, paramIndex, opts) {
    const ModelClass = param_decor_base_1.getParamType(proto, method, paramIndex);
    const { ItemClass, isPartial } = opts;
    const translateOpt = (opts.enableValidation != null)
        ? { enableValidation: opts.enableValidation }
        : null;
    const errPrefix = `In ${proto.constructor.name}.${method}:`;
    if (ModelClass === Array) {
        return common_1.Result.Ok(toArray(ItemClass, isPartial, translateOpt, errPrefix));
    }
    else if (typeof ModelClass['getTranslator'] === 'function') {
        return common_1.Result.Ok(translate(ModelClass, isPartial, translateOpt, errPrefix));
    }
    else if (ItemClass) {
        return common_1.Result.Ok(translate(ItemClass, isPartial, translateOpt, errPrefix));
    }
    return common_1.Result.Failure(`${errPrefix} Cannot automatically infer model type. ItemClass must be specified.`);
}
function toArray(ItemClass, isPartial, translateOpt, errPrefix) {
    return function (rawModel) {
        if (Array.isArray(rawModel) && ItemClass) {
            return rawModel.map(translate(ItemClass, isPartial, translateOpt, errPrefix));
        }
        else if (ItemClass) {
            // Wrap single value of one-item array
            return [translate(ItemClass, isPartial, translateOpt, errPrefix)(rawModel)];
        }
        throw new common_1.MinorException(`${errPrefix} Cannot automatically infer model type. ItemClass must be specified.`);
    };
}
function translate(Class, isPartial, translateOpt, errPrefix) {
    return function (raw) {
        common_1.Guard.assertIsDefined(Class.getTranslator, `${errPrefix} ItemClass must be translatable (by either extending class Translatable`
            + ' or decorated with @translatable())');
        const translator = Class.getTranslator();
        const func = Boolean(isPartial) ? translator.partial : translator.whole;
        return func.call(translator, raw, translateOpt);
    };
}
//# sourceMappingURL=model.js.map