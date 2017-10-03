/// <reference types="reflect-metadata" />

import { IDependencyContainer, CriticalException } from 'back-lib-common-util';

import { MetaData } from '../constants/MetaData';
import { serverContext } from '../ServerContext';


export type HttpVerbs = 'GET' | 'POST';
export type ActionDecorator = (method?: string, path?: string) => Function;

/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
 * @param {string} path Segment of URL pointing to this controller.
 * 		If not specified, it is default to be empty tring.
 */
export function action(method: string = 'GET', path?: string): Function {
	return function (proto: any, funcName: string): Function {
		if (Reflect.hasOwnMetadata(MetaData.ACTION, proto[funcName])) {
			throw new CriticalException('Duplicate action decorator');
		}

		if (path == null) {
			path = '';
		} else {
			if (path.startsWith('/')) {
				// Remove heading slash
				path = path.substring(1);
			}
			if (path.endsWith('/')) {
				// Remove trailing slash
				path = path.substr(0, path.length - 1);
			}
		}
		path = path.toLowerCase();

		Reflect.defineMetadata(MetaData.ACTION, [method, path], proto[funcName]);

		return proto;
	};

}