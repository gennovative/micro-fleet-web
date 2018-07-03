/// <reference types="reflect-metadata" />

import { CriticalException } from '@micro-fleet/common';

import { MetaData } from '../constants/MetaData';


export type ActionDecorator = (method?: string, path?: string) => Function;

/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
 * @param {string} path Segment of URL pointing to this controller.
 * 		If '_' is given, uses target function name as path.
 * 		If not specified, it is default to be empty tring.
 */
export function action(method: string = 'GET', path: string = ''): Function {
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

		Reflect.defineMetadata(MetaData.ACTION, [method, path], proto.constructor, funcName);

		return proto;
	};

}