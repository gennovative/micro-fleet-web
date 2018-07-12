"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ActionFilterBase {
    addReadonlyProp(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            writable: false,
            enumerable: true,
            configurable: false,
            value
        });
    }
}
exports.ActionFilterBase = ActionFilterBase;
//# sourceMappingURL=ActionFilterBase.js.map