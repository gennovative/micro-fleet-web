"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const acorn = require("acorn");
const back_lib_common_util_1 = require("back-lib-common-util");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * 		Default as "execute".
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function filter(FilterClass, filterFunc, priority) {
    return function (TargetClass, key) {
        // If `key` has value, `targetClass` is "prototype" object, otherwise it's a class.
        let metaKey, isCtrlScope = (!key);
        if (isCtrlScope) {
            metaKey = MetaData_1.MetaData.CONTROLLER_FILTER;
        }
        else {
            TargetClass = TargetClass.constructor;
            metaKey = MetaData_1.MetaData.ACTION_FILTER;
        }
        let filters = isCtrlScope
            ? Reflect.getOwnMetadata(metaKey, TargetClass)
            : Reflect.getMetadata(metaKey, TargetClass, key);
        filters = filters || [];
        addFilterToArray(filters, FilterClass, filterFunc, priority);
        Reflect.defineMetadata(metaKey, filters, TargetClass, key);
        return TargetClass;
    };
}
exports.filter = filter;
function addFilterToArray(filters, FilterClass, filterFunc, priority) {
    priority = priority || 5;
    back_lib_common_util_1.Guard.assertIsTruthy(priority >= 1 && priority <= 10, 'Filter priority must be between 1 and 10.');
    back_lib_common_util_1.Guard.assertIsTruthy(FilterClass.name.endsWith('Filter'), 'Filter class name must end with "Filter".');
    let filterFuncName;
    if (filterFunc != null) {
        let func = acorn.parse(filterFunc.toString()), body = func.body[0], expression = body.expression, isArrowFunc = expression.type == 'ArrowFunctionExpression';
        back_lib_common_util_1.Guard.assertIsTruthy(isArrowFunc, '`filterFunc` must be an arrow statement.');
        filterFuncName = expression.body['property']['name'];
    }
    else {
        filterFuncName = 'execute';
    }
    // `filters` is a 3-dimensioned matrix:
    // filters = [
    //		1: [ [FilterClass, funcName], [FilterClass, funcName] ]
    //		5: [ [FilterClass, funcName], [FilterClass, funcName] ]
    // ]
    filters[priority] = filters[priority] || [];
    filters[priority].push([FilterClass, filterFuncName]);
}
exports.addFilterToArray = addFilterToArray;
