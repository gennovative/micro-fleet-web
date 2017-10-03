"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata');
}
const lazyInject_1 = require("./lazyInject");
const controller_1 = require("./controller");
const action_1 = require("./action");
exports.decorators = {
    lazyInject: lazyInject_1.lazyInject,
    controller: controller_1.controller,
    action: action_1.action
};

//# sourceMappingURL=index.js.map
