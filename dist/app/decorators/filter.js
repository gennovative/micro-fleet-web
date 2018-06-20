"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const MetaData_1 = require("../constants/MetaData");
/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function filter(FilterClass, priority = 5) {
    return function (TargetClass, key) {
        return addFilterToTarget(FilterClass, TargetClass, key, priority);
    };
}
exports.filter = filter;
/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClass The filter class.
 * @param TargetClassOrPrototype A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is prototype object,
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
function addFilterToTarget(FilterClass, TargetClassOrPrototype, targetFunc, priority = 5) {
    let metaKey, isClassScope = (!targetFunc); // If `targetFunc` has value, `targetClass` is "prototype" object, otherwise it's a class.
    if (isClassScope) {
        metaKey = MetaData_1.MetaData.CONTROLLER_FILTER;
    }
    else {
        // If @filter is applied to class method, the given `TargetClass` is actually the class's prototype.
        TargetClassOrPrototype = TargetClassOrPrototype.constructor;
        metaKey = MetaData_1.MetaData.ACTION_FILTER;
    }
    let filters = isClassScope
        ? Reflect.getOwnMetadata(metaKey, TargetClassOrPrototype)
        : Reflect.getMetadata(metaKey, TargetClassOrPrototype, targetFunc);
    filters = filters || [];
    pushFilterToArray(filters, FilterClass, priority);
    Reflect.defineMetadata(metaKey, filters, TargetClassOrPrototype, targetFunc);
    return TargetClassOrPrototype;
}
exports.addFilterToTarget = addFilterToTarget;
/**
 * Prepares a filter then push it to given array.
 */
function pushFilterToArray(filters, FilterClass, priority = 5) {
    common_1.Guard.assertIsTruthy(priority >= 1 && priority <= 10, 'Filter priority must be between 1 and 10.');
    // `filters` is a 2-dimensioned matrix, with indexes are priority value,
    //   values are array of Filter classes. Eg:
    // filters = [
    //		1: [ FilterClass, FilterClass ]
    //		5: [ FilterClass, FilterClass ]
    // ]
    filters[priority] = filters[priority] || [];
    filters[priority].push(FilterClass);
}
exports.pushFilterToArray = pushFilterToArray;
//# sourceMappingURL=filter.js.map