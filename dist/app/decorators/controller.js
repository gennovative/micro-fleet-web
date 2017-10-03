"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const back_lib_common_util_1 = require("back-lib-common-util");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to decorate REST controller class.
 * @param {string} depIdentifier Key to look up and resolve from dependency container.
 * @param {string} path Segment of URL pointing to this controller.
 * 		If not specified, it is extract from controller class name: {path}Controller.
 */
function controller(depIdentifier, path = '') {
    return function (targetClass) {
        if (Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, targetClass)) {
            throw new back_lib_common_util_1.CriticalException('Duplicate controller decorator');
        }
        if (path == null) {
            path = targetClass.name.match(/(.+)Controller$/)[1];
            back_lib_common_util_1.Guard.assertIsDefined(path, 'Cannot extract path from controller name');
        }
        else {
            if (path.startsWith('/')) {
                // Remove heading slash
                path = path.substring(1);
            }
            if (path.length >= 1 && !path.endsWith('/')) {
                // Remove trailing slash
                path = path + '/';
            }
        }
        path = path.toLowerCase();
        Reflect.defineMetadata(MetaData_1.MetaData.CONTROLLER, [depIdentifier, path], targetClass);
        return targetClass;
    };
}
exports.controller = controller;

//# sourceMappingURL=controller.js.map
