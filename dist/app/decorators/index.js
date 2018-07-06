"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata');
}
const authorized_1 = require("./authorized");
const lazyInject_1 = require("./lazyInject");
const controller_1 = require("./controller");
const filter_1 = require("./filter");
const act = require("./action");
/**
 * Represents the order in which filters are invoked.
 */
exports.FilterPriority = filter_1.FilterPriority;
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
    lazyInject: lazyInject_1.lazyInject,
};
//# sourceMappingURL=index.js.map