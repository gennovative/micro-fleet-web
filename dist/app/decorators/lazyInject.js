"use strict";
/// <reference types="reflect-metadata" />
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const INJECTION = Symbol();
function proxyGetter(proto, key, resolve) {
    function getter() {
        if (!Reflect.hasMetadata(INJECTION, this, key)) {
            Reflect.defineMetadata(INJECTION, resolve(), this, key);
        }
        return Reflect.getMetadata(INJECTION, this, key);
    }
    function setter(newVal) {
        Reflect.defineMetadata(INJECTION, newVal, this, key);
    }
    const desc = Object.getOwnPropertyDescriptor(proto, key) || {
        configurable: true,
        enumerable: true,
    };
    desc.get = getter;
    desc.set = setter;
    Object.defineProperty(proto, key, desc);
}
/**
 * Injects value to the decorated property.
 * Used to decorate properties of a class that's cannot be resolved by dependency container.
 */
function lazyInject(depIdentifier) {
    return function (proto, key) {
        const resolve = () => common_1.serviceContext.dependencyContainer.resolve(depIdentifier);
        proxyGetter(proto, key, resolve);
    };
}
exports.lazyInject = lazyInject;
//# sourceMappingURL=lazyInject.js.map