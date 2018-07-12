import * as express from 'express';
import { Guard, ModelAutoMapper } from '@micro-fleet/common';

import { IActionFilter } from '../decorators/filter';
import { ActionFilterBase } from './ActionFilterBase';


export type ModelFilterOptions = {
	/**
	 * The target model class.
	 */
	ModelClass: Newable;

	/**
	 * Whether this request contains all properties of model class,
	 * or just some of them.
	 * Default: false
	 */
	isPartial?: boolean;

	/**
	 * Function to extract model object from request body.
	 * As default, model object is extracted from `request.body.model`.
	 */
	modelPropFn?: (request: express.Request) => any;
};

export class ModelFilter 
	extends ActionFilterBase
	implements IActionFilter {

	public execute(request: express.Request, response: express.Response, next: Function,
			options: ModelFilterOptions): void {
		try {
			const { ModelClass, isPartial, modelPropFn } = options;
			Guard.assertArgDefined('ModelClass', ModelClass);
			Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator']);
			const translator: ModelAutoMapper<any> = ModelClass['translator'];
			const func: Function = (!!isPartial) ? translator.partial : translator.whole;
			const rawModel = (request.body && request.body.model) ? request.body.model : modelPropFn(request);
			const model = func.call(translator, rawModel);
			this.addReadonlyProp(request, 'model', model);
			next();
		} catch (err) {
			console.error(err);
			next(err);
		}
	}
}