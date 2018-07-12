"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelFilter_1 = require("../filters/ModelFilter");
const filter_1 = require("./filter");
/**
 * Marks a controller or action to require auth token to be accessible.
 */
function model(opts) {
    return function (TargetClass, key) {
        TargetClass = filter_1.addFilterToTarget(ModelFilter_1.ModelFilter, TargetClass, key, filter_1.FilterPriority.HIGH, opts);
        return TargetClass;
    };
}
exports.model = model;
//# sourceMappingURL=model.js.map