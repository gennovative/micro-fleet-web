/// <reference types="reflect-metadata" />

import { IDependencyContainer, CriticalException, Guard } from 'back-lib-common-util';

import { MetaData } from '../constants/MetaData';
import { serverContext } from '../ServerContext';


export type ControllerDecorator = (depIdentifier: symbol | string, path?: string) => Function;


/**
 * Used to decorate REST controller class.
 * @param {string} depIdentifier Key to look up and resolve from dependency container.
 * @param {string} path Segment of URL pointing to this controller.
 * 		If not specified, it is extract from controller class name: {path}Controller.
 */
export function controller(depIdentifier: symbol | string, path: string = ''): Function {
	return function (targetClass: Function): Function {
		if (Reflect.hasOwnMetadata(MetaData.CONTROLLER, targetClass)) {
			throw new CriticalException('Duplicate controller decorator');
		}

		if (path == null) {
			path = targetClass.name.match(/(.+)Controller$/)[1];
			Guard.assertIsDefined(path, 'Cannot extract path from controller name');
		} else {
			if (path.startsWith('/')) {
				// Remove heading slash
				path = path.substring(1);
			}
			if (path.length >= 1 && !path.endsWith('/')) {
				// Remove trailing slash
				path = path + '/';
			}
		}
		path = path.toLowerCase();

		Reflect.defineMetadata(MetaData.CONTROLLER, [depIdentifier, path], targetClass);

		return targetClass;
	};
}