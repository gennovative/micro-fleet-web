"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata');
}
const act = require("./action");
const controller_1 = require("./controller");
const m = require("./model");
const extras_1 = require("./extras");
const filter_1 = require("./filter");
const header_1 = require("./header");
const request_1 = require("./request");
const response_1 = require("./response");
const param_1 = require("./param");
const query_1 = require("./query");
__export(require("./param-decor-base"));
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
    filter: filter_1.filter,
    middleware: filter_1.middleware,
    extras: extras_1.extras,
    header: header_1.header,
    model: m.model,
    request: request_1.request,
    response: response_1.response,
    param: param_1.param,
    query: query_1.query,
};
//# sourceMappingURL=index.js.map