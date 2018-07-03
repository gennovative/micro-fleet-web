// Empty operation name => must login
// Non-empty op name => check op's conditions => must or no need to login

/// <reference types="reflect-metadata" />

import { AuthorizeFilter } from '../filters/AuthorizeFilter';
import { addFilterToTarget } from './filter';


export type AuthorizedDecorator = (
	FilterClass: Newable,
	priority?: number
) => Function;


/**
 * Used to add filter to controller class and controller action.
 * @param {class} FilterClass Filter class whose name must end with "Filter".
 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
 * 		This array function won't be executed, but is used to extract filter function name.
 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
 */
export function authorized(): Function {

	return function (TargetClass: Newable, key: string): Function {
		// const isMethodScope: boolean = !!key; // If `key` has value, `TargetClass` is "prototype" object, otherwise it's a class.
		// if (isMethodScope) {
		// }
		TargetClass = addFilterToTarget<AuthorizeFilter>(AuthorizeFilter, TargetClass, key, 9) as Newable;
		return TargetClass;
	};
}