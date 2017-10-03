if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
	require('reflect-metadata');
}

import { lazyInject, LazyInjectDecorator } from './lazyInject';
import { controller, ControllerDecorator } from './controller';
import { action, ActionDecorator } from './action';

export const decorators: {

	/**
	 * Injects value to the decorated property. 
	 * Used to decorate properties of a class that's cannot be resolved by dependency container.
	 */
	lazyInject: LazyInjectDecorator,

	/**
	 * Used to decorate REST controller class.
	 * @param {string} depIdentifier Key to look up and resolve from dependency container.
	 * @param {string} path Segment of URL pointing to this controller,
	 * 		if not specified, it is extract from controller class name: {path}Controller.
	 */
	controller: ControllerDecorator,

	/**
	 * Used to decorate action function of REST controller class.
	 * @param {string} path Segment of URL pointing to this controller.
	 * 		If not specified, it is default to be empty tring.
	 */
	action: ActionDecorator
} = {
	lazyInject,
	controller,
	action
};
