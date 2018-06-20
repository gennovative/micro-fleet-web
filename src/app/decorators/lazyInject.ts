/// <reference types="reflect-metadata" />

import { serviceContext } from '@micro-fleet/common';


const INJECTION = Symbol();

function proxyGetter(proto: any, key: string, resolve: () => any) {
	function getter(this: any) {
		if (!Reflect.hasMetadata(INJECTION, this, key)) {
			Reflect.defineMetadata(INJECTION, resolve(), this, key);
		}
		return Reflect.getMetadata(INJECTION, this, key);
	}

	function setter(this: any, newVal: any) {
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

export type LazyInjectDecorator = (depIdentifier: symbol | string) => Function;

/**
 * Injects value to the decorated property. 
 * Used to decorate properties of a class that's cannot be resolved by dependency container.
 */
export function lazyInject(depIdentifier: symbol | string): Function {
	return function (proto: any, key: string): void {
		const resolve = () => serviceContext.dependencyContainer.resolve(depIdentifier);
		proxyGetter(proto, key, resolve);
	};
}