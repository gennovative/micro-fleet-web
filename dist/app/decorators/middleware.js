"use strict";
// /// <reference types="reflect-metadata" />
// import { RequestHandler } from 'express'
// import { MetaData } from '../constants/MetaData'
// /**
//  * Used to add Express middleware to controller class and controller action.
//  * Middlewares run before all Micro Fleet filters.
//  */
// export function middleware(handler: RequestHandler): PropertyDecorator | ClassDecorator {
//     return function (TargetClass: Object, propertyKey: string | symbol) {
//         return addMiddlewareToTarget(handler, TargetClass, propertyKey)
//     }
// }
// /**
//  * Adds a middleware to `TargetClass`. `TargetClass` can be a class or class prototype,
//  * depending on whether the middleware is meant to apply on class or class method.
//  * @param handler The request handler returned by a middleware call.
//  * @param TargetClassOrPrototype A class or class prototype.
//  * @param targetFunc Method name, if `TargetClass` is prototype object
//  */
// export function addMiddlewareToTarget(handler: RequestHandler, TargetClassOrPrototype: Object, targetFunc?: string | symbol) {
//     const isClassScope = (!targetFunc) // If `targetFunc` has value, `targetClass` is "prototype" object, otherwise it's a class.
//     let metaKey: string
//     if (isClassScope) {
//         metaKey = MetaData.CONTROLLER_MIDDLEWARE
//     } else {
//         // If @middleware is applied to class method, the given `TargetClass` is actually the class's prototype.
//         TargetClassOrPrototype = <any>TargetClassOrPrototype.constructor
//         metaKey = MetaData.ACTION_MIDDLEWARE
//     }
//     let middlewares: RequestHandler[] = isClassScope
//         ? Reflect.getOwnMetadata(metaKey, TargetClassOrPrototype)
//         : Reflect.getMetadata(metaKey, TargetClassOrPrototype, targetFunc)
//     middlewares = middlewares || []
//     middlewares.push(handler)
//     Reflect.defineMetadata(metaKey, middlewares, TargetClassOrPrototype, targetFunc)
//     return TargetClassOrPrototype
// }
//# sourceMappingURL=middleware.js.map