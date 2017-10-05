// Handle validation errors
// Handle server internal errors

import * as express from 'express';

import { injectable, inject } from 'back-lib-common-util';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class AuthorizeFilter {

	constructor(
		// @inject() private logProvider: ILogProvider
	) {
	}

	public handle(req: express.Request, res: express.Response, next: Function): void {
		next();
	}
}