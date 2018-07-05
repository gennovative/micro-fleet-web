"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function action(method = 'get', path) {
    return function (proto, funcName) {
        if (!path) {
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
            actionDesc[method.toLowerCase()] = path;
        }
        else {
            actionDesc = {
                [method.toLowerCase()]: path
            };
        }
        Reflect.defineMetadata(MetaData_1.MetaData.ACTION, actionDesc, proto.constructor, funcName);
        return proto;
    };
}
exports.action = action;
/**
 * Used to decorate an action that accepts GET request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function GET(path) {
    return action('get', path);
}
exports.GET = GET;
/**
 * Used to decorate an action that accepts POST request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function POST(path) {
    return action('post', path);
}
exports.POST = POST;
/**
 * Used to decorate an action that accepts PUT request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function PUT(path) {
    return action('put', path);
}
exports.PUT = PUT;
/**
 * Used to decorate an action that accepts PATCH request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function PATCH(path) {
    return action('patch', path);
}
exports.PATCH = PATCH;
/**
 * Used to decorate an action that accepts DELETE request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
function DELETE(path) {
    return action('delete', path);
}
exports.DELETE = DELETE;
//# sourceMappingURL=action.js.map