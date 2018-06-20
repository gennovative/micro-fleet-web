// Handle validation errors
// Handle server internal errors

import * as express from 'express';
import { injectable, ValidationError } from '@micro-fleet/common';

import { IActionFilter } from '../decorators/filter';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class ErrorHandlerFilter implements IActionFilter {

	constructor(
		// @inject() private logProvider: ILogProvider
	) {
	}

	public execute(req: express.Request, res: express.Response, next: Function): void {
		try {
			next();
		} catch (err) {
			if (err instanceof ValidationError) {
				res.status(412).send(err);
			}
			else {
				// logProvider.error(err);
				res.status(500).send('server.error.internal');
			}
		}
	}
}