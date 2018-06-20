/// <reference types="reflect-metadata" />

import { Guard } from '@micro-fleet/common';

import { MetaData } from '../constants/MetaData';


/**
 * Provides operations to intercept HTTP requests to a controller.
 */
export interface IActionFilter {
	execute(request: any, response: any, next: Function): void;
}

export type FilterDecorator = <T>(
		FilterClass: new (...param: any[]) => T,
		priority?: number
	) => Function;

export type FilterArray<T extends IActionFilter = IActionFilter> = Newable<T>[];
export type PrioritizedFilterArray = FilterArray[];
	

/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
export function filter<T extends IActionFilter>(FilterClass: Newable<T>, priority: number = 5): Function {

	return function (TargetClass: Newable<T>, key: string): Function {
		return addFilterToTarget(FilterClass, TargetClass, key, priority);
	};
}

/**
 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
 * depending on whether the filter is meant to apply on class or class method.
 * @param FilterClass The filter class.
 * @param TargetClassOrPrototype A class or class prototype.
 * @param targetFunc Method name, if `TargetClass` is prototype object,
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
export function addFilterToTarget<T extends IActionFilter>(FilterClass: Newable<T>,
		TargetClassOrPrototype: Newable<T>, targetFunc?: string, priority: number = 5): Function {

	let metaKey: string,
		isClassScope = (!targetFunc); // If `targetFunc` has value, `targetClass` is "prototype" object, otherwise it's a class.
	if (isClassScope) {
		metaKey = MetaData.CONTROLLER_FILTER;
	} else {
		// If @filter is applied to class method, the given `TargetClass` is actually the class's prototype.
		TargetClassOrPrototype = <any>TargetClassOrPrototype.constructor;
		metaKey = MetaData.ACTION_FILTER;
	}

	let filters: PrioritizedFilterArray = isClassScope
		? Reflect.getOwnMetadata(metaKey, TargetClassOrPrototype)
		: Reflect.getMetadata(metaKey, TargetClassOrPrototype, targetFunc);
	filters = filters || [];

	pushFilterToArray(filters, FilterClass, priority);
	Reflect.defineMetadata(metaKey, filters, TargetClassOrPrototype, targetFunc);
	return TargetClassOrPrototype;
}

/**
 * Prepares a filter then push it to given array.
 */
export function pushFilterToArray<T extends IActionFilter>(filters: PrioritizedFilterArray, FilterClass: Newable<T>, priority: number = 5): void {
	Guard.assertIsTruthy(priority >= 1 && priority <= 10, 'Filter priority must be between 1 and 10.');


	// `filters` is a 2-dimensioned matrix, with indexes are priority value,
	//   values are array of Filter classes. Eg:
	// filters = [
	//		1: [ FilterClass, FilterClass ]
	//		5: [ FilterClass, FilterClass ]
	// ]
	filters[priority] = filters[priority] || [];
	filters[priority].push(FilterClass);
}