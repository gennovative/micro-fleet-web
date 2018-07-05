/// <reference types="reflect-metadata" />

import { CriticalException } from '@micro-fleet/common';

import { MetaData } from '../constants/MetaData';


export type ActionDecorator = (method?: string, path?: string) => Function;

/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function action(method: string = 'get', path?: string): Function {
	return function (proto: any, funcName: string): Function {
		if (Reflect.hasOwnMetadata(MetaData.ACTION, proto.constructor, funcName)) {
			throw new CriticalException('Duplicate action decorator');
		}

		if (!path) {
			path = funcName;
		} else if (path.length > 1) {
			if (!path.startsWith('/')) {
				// Add heading slash
				path = '/' + path;
			}
			if (path.endsWith('/')) {
				// Remove trailing slash
				path = path.substr(0, path.length - 1);
			}
		}

		Reflect.defineMetadata(MetaData.ACTION, [method.toLowerCase(), path], proto.constructor, funcName);
		return proto;
	};
}

/**
 * Used to decorate an action that accepts GET request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function GET(path?: string): Function {
	return action('get', path);
}

/**
 * Used to decorate an action that accepts POST request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function POST(path?: string): Function {
	return action('post', path);
}

/**
 * Used to decorate an action that accepts PUT request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function PUT(path?: string): Function {
	return action('put', path);
}

/**
 * Used to decorate an action that accepts PATCH request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function PATCH(path?: string): Function {
	return action('patch', path);
}

/**
 * Used to decorate an action that accepts DELETE request.
 * @param {string} path Segment of URL pointing to this action.
 * 		If not specified, it is default to be the action's function name.
 */
export function DELETE(path?: string): Function {
	return action('delete', path);
}