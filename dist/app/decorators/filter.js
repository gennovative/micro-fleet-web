"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const MetaData_1 = require("../constants/MetaData");
/**
 * Represents the order in which filters are invoked.
 */
var FilterPriority;
(function (FilterPriority) {
    FilterPriority[FilterPriority["LOW"] = 0] = "LOW";
    FilterPriority[FilterPriority["MEDIUM"] = 1] = "MEDIUM";
    FilterPriority[FilterPriority["HIGH"] = 2] = "HIGH";
})(FilterPriority = exports.FilterPriority || (exports.FilterPriority = {}));
const FILTER_INDICATOR = Symbol();
/**
 * Marks the given Class as MicroFleet filter class.
 */
function markAsFilterClass(Class) {
    return Class[FILTER_INDICATOR] = true;
}
exports.markAsFilterClass = markAsFilterClass;
/**
 * Checks if the given Class is a MicroFleet filter class.
 */
function isFilterClass(Class) {
    return Class[FILTER_INDICATOR];
}
exports.isFilterClass = isFilterClass;
/**
 * Used to add filter to controller class and controller action.
 * If you want to add raw Express middleware, use @middleware() instead.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
 */
function filter(FilterClass, priority = FilterPriority.MEDIUM, ...filterParams) {
    return function (TargetClass, propertyKey) {
        markAsFilterClass(FilterClass);
        return addFilterToTarget(FilterClass, TargetClass, propertyKey, priority, ...filterParams);
    };
}
exports.filter = filter;
/**
 * Used to add Express middleware to controller class and controller action.
 * All Express middlewares are of FilterPriority.MEDIUM.
 */
function middleware(handler) {
    return function (TargetClass, propertyKey) {
        return addFilterToTarget(handler, TargetClass, propertyKey, FilterPriority.MEDIUM);
    };
}
exports.middleware = middleware;
/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClassOrMiddleware The filter class or Express middleware.
 * @param TargetClassOrPrototype A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is prototype object,
 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
 */
function addFilterToTarget(FilterClassOrMiddleware, TargetClassOrPrototype, targetFunc, priority = FilterPriority.MEDIUM, ...filterParams) {
    const isClassScope = (!targetFunc); // If `targetFunc` has value, `targetClass` is "prototype" object, otherwise it's a class.
    let metaKey;
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
    pushFilterToArray(filters, FilterClassOrMiddleware, priority, ...filterParams);
    Reflect.defineMetadata(metaKey, filters, TargetClassOrPrototype, targetFunc);
    return TargetClassOrPrototype;
}
exports.addFilterToTarget = addFilterToTarget;
/**
 * Prepares a filter then push it to given array.
 */
function pushFilterToArray(filters, FilterClassOrMiddleware, priority = FilterPriority.MEDIUM, ...filterParams) {
    common_1.Guard.assertIsTruthy(priority >= FilterPriority.LOW && priority <= FilterPriority.HIGH, 'Invalid filter priority.');
    // `filters` is a 2-dimensioned matrix, with indexes are priority value,
    //   values are array of Filter classes. Eg:
    // filters = [
    //        1: [ FilterClass, FilterClass ]
    //        3: [ FilterClass, FilterClass ]
    // ]
    filters[priority] = filters[priority] || [];
    filters[priority].push({ FilterClass: FilterClassOrMiddleware, filterParams });
}
exports.pushFilterToArray = pushFilterToArray;
//# sourceMappingURL=filter.js.map