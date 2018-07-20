"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata');
}
const controller_1 = require("./controller");
const authorized_1 = require("./authorized");
const model_1 = require("./model");
const filter_1 = require("./filter");
const act = require("./action");
exports.decorators = {
    ALL: act.ALL,
    DELETE: act.DELETE,
    GET: act.GET,
    POST: act.POST,
    PATCH: act.PATCH,
    PUT: act.PUT,
    HEAD: act.HEAD,
    OPTIONS: act.OPTIONS,
    action: act.action,
    controller: controller_1.controller,
    authorized: authorized_1.authorized,
    filter: filter_1.filter,
    model: model_1.model,
};
//# sourceMappingURL=index.js.map