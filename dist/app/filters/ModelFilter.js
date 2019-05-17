"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const ActionFilterBase_1 = require("./ActionFilterBase");
class ModelFilter extends ActionFilterBase_1.ActionFilterBase {
    execute(request, response, next, options) {
        try {
            const { ModelClass, isPartial, modelPropFn } = options;
            common_1.Guard.assertArgDefined('ModelClass', ModelClass);
            common_1.Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator']);
            const translator = ModelClass['translator'];
            const func = (!!isPartial) ? translator.partial : translator.whole;
            const rawModel = (request.body && request.body.model) ? request.body.model : modelPropFn(request);
            const model = func.call(translator, rawModel);
            this.addReadonlyProp(request.extras, 'model', model);
            next();
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    }
}
exports.ModelFilter = ModelFilter;
//# sourceMappingURL=ModelFilter.js.map