// Handle validation errors
// Handle server internal errors

import * as express from 'express';
import { injectable } from '@micro-fleet/common';

import { IActionFilter } from '../decorators/filter';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class AuthorizeFilter implements IActionFilter {

	constructor(
		// @inject() private logProvider: ILogProvider
	) {
	}

	public execute(req: express.Request, res: express.Response, next: Function): any {
		if (!req.header('Authorization')) {
			return res.status(401).send();
		}
		// TODO: Decode token to get user ID
		// Look up user role based on user ID
		// Check if
		next();
	}
}