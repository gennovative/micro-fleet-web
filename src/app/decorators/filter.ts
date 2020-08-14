/// <reference types="reflect-metadata" />

import { RequestHandler } from 'express'
import { Guard, Newable } from '@micro-fleet/common'

import { MetaData } from '../constants/MetaData'


/**
 * Provides operations to intercept HTTP requests to a controller.
 */
export interface IActionFilter {
    execute(request: any, response: any, next: Function, ...params: any[]): void | Promise<void>
}

/**
 * Provides operations to handle errors thrown from controller actions.
 */
export interface IActionErrorHandler {
    execute(error: any, request: any, response: any, next: Function): void
}

export type ActionInterceptor = IActionFilter | IActionErrorHandler

/**
 * Represents the order in which filters are invoked.
 */
export enum FilterPriority { LOW, MEDIUM, HIGH }

export type FilterDecorator = <T extends ActionInterceptor>(
        FilterClass: Newable<T>,
        priority?: FilterPriority,
        ...filterParams: any[]
    ) => Function

/**
 * Represents an array of MicroFleet filter classes or Express middlewares.
 */
export type FilterArray<T extends ActionInterceptor = ActionInterceptor> = {
    FilterClass: Newable<T> | RequestHandler,
    filterParams: any[]
}[]
export type PrioritizedFilterArray = FilterArray[]

const FILTER_INDICATOR = Symbol()


/**
 * Marks the given Class as MicroFleet filter class.
 */
export function markAsFilterClass(Class: object | Function): boolean {
    return Class[FILTER_INDICATOR] = true
}

/**
 * Checks if the given Class is a MicroFleet filter class.
 */
export function isFilterClass(Class: object | Function): boolean {
    return Class[FILTER_INDICATOR]
}

/**
 * Used to add filter to controller class and controller action.
 * If you want to add raw Express middleware, use @middleware() instead.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
 */
export function filter<T extends ActionInterceptor>(FilterClass: Newable<T>, priority: FilterPriority = FilterPriority.MEDIUM,
    ...filterParams: any[]): Function {

    return function (TargetClass: any, propertyKey: string | symbol) {
        markAsFilterClass(FilterClass)
        return addFilterToTarget(FilterClass, TargetClass, propertyKey, priority, ...filterParams)
    }
}

/**
 * Used to add Express middleware to controller class and controller action.
 * All Express middlewares are of FilterPriority.MEDIUM.
 */
export function middleware(handler: RequestHandler): PropertyDecorator | ClassDecorator {
    return function (TargetClass: Object, propertyKey: string | symbol) {
        return addFilterToTarget(handler, TargetClass as any, propertyKey, FilterPriority.MEDIUM)
    }
}

/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClassOrMiddleware The filter class or Express middleware.
 * @param TargetClassOrPrototype A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is prototype object,
 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
 */
export function addFilterToTarget<T extends ActionInterceptor>(FilterClassOrMiddleware: Newable<T> | RequestHandler,
        TargetClassOrPrototype: Newable<T>, targetFunc?: string | symbol, priority: FilterPriority = FilterPriority.MEDIUM,
        ...filterParams: any[]) {

    const isClassScope = (!targetFunc) // If `targetFunc` has value, `targetClass` is "prototype" object, otherwise it's a class.
    let metaKey: string
    if (isClassScope) {
        metaKey = MetaData.CONTROLLER_FILTER
    } else {
        // If @filter is applied to class method, the given `TargetClass` is actually the class's prototype.
        TargetClassOrPrototype = <any>TargetClassOrPrototype.constructor
        metaKey = MetaData.ACTION_FILTER
    }

    let filters: PrioritizedFilterArray = isClassScope
        ? Reflect.getOwnMetadata(metaKey, TargetClassOrPrototype)
        : Reflect.getMetadata(metaKey, TargetClassOrPrototype, targetFunc)
    filters = filters || []

    pushFilterToArray(filters, FilterClassOrMiddleware, priority, ...filterParams)
    Reflect.defineMetadata(metaKey, filters, TargetClassOrPrototype, targetFunc)
    return TargetClassOrPrototype
}

/**
 * Prepares a filter then push it to given array.
 */
export function pushFilterToArray<T extends ActionInterceptor>(filters: PrioritizedFilterArray,
        FilterClassOrMiddleware: Newable<T> | RequestHandler, priority: FilterPriority = FilterPriority.MEDIUM,
        ...filterParams: any[]): void {
    Guard.assertIsTruthy(priority >= FilterPriority.LOW && priority <= FilterPriority.HIGH, 'Invalid filter priority.')

    // `filters` is a 2-dimensioned matrix, with indexes are priority value,
    //   values are array of Filter classes. Eg:
    // filters = [
    //        1: [ FilterClass, FilterClass ]
    //        3: [ FilterClass, FilterClass ]
    // ]
    filters[priority] = filters[priority] || []
    filters[priority].push({ FilterClass: FilterClassOrMiddleware, filterParams })
}
