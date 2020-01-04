"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="reflect-metadata" />
const common_1 = require("@micro-fleet/common");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to decorate action function of REST controller class.
 * @param {string} verb Case-insensitive HTTP verb supported by Express
     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function action(verb, path) {
    return function (proto, funcName) {
        common_1.Guard.assertIsTruthy(funcName, 'This decorator is for action method inside controller class');
        if (!path && typeof funcName === 'string') {
            path = `/${funcName}`;
        }
        else if (path.length > 1) {
            if (!path.startsWith('/')) {
                // Add heading slash
                path = '/' + path;
            }
            if (path.endsWith('/')) {
                // Remove trailing slash
                path = path.substr(0, path.length - 1);
            }
        }
        let actionDesc;
        if (Reflect.hasOwnMetadata(MetaData_1.MetaData.ACTION, proto.constructor, funcName)) {
            actionDesc = Reflect.getOwnMetadata(MetaData_1.MetaData.ACTION, proto.constructor, funcName);
            actionDesc[verb.toLowerCase()] = path;
        }
        else {
            actionDesc = {
                [verb.toLowerCase()]: path,
            };
        }
        Reflect.defineMetadata(MetaData_1.MetaData.ACTION, actionDesc, proto.constructor, funcName);
        return proto;
    };
}
exports.action = action;
/**
 * Used to decorate an action that accepts request of ALL verbs.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function ALL(path) {
    return action('all', path);
}
exports.ALL = ALL;
/**
 * Used to decorate an action that accepts GET request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function GET(path) {
    return action('get', path);
}
exports.GET = GET;
/**
 * Used to decorate an action that accepts POST request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function POST(path) {
    return action('post', path);
}
exports.POST = POST;
/**
 * Used to decorate an action that accepts PUT request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function PUT(path) {
    return action('put', path);
}
exports.PUT = PUT;
/**
 * Used to decorate an action that accepts PATCH request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function PATCH(path) {
    return action('patch', path);
}
exports.PATCH = PATCH;
/**
 * Used to decorate an action that accepts DELETE request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function DELETE(path) {
    return action('delete', path);
}
exports.DELETE = DELETE;
/**
 * Used to decorate an action that accepts HEAD request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function HEAD(path) {
    return action('head', path);
}
exports.HEAD = HEAD;
/**
 * Used to decorate an action that accepts OPTIONS request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
function OPTIONS(path) {
    return action('options', path);
}
exports.OPTIONS = OPTIONS;
//# sourceMappingURL=action.js.map