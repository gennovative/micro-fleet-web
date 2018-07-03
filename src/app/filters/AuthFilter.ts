import * as express from 'express';

import { AuthAddOn } from '../AuthAddOn';
import { IActionFilter } from '../decorators/filter';
import { lazyInject } from '../decorators/lazyInject';
import { Types as T } from '../Types';


export class AuthFilter implements IActionFilter {

	@lazyInject(T.AUTH_ADDON) private _authAddon: AuthAddOn;

	public async execute(request: express.Request, response: express.Response, next: Function): Promise<any> {
		try {
			const authResult = await this._authAddon.authenticate(request, response, next);
			if (!authResult) {
				return response.sendStatus(401);
			} else if (!authResult.payload) {
				if (authResult.info) {
					return response.status(401).json({message: authResult.info.message, name: authResult.info.name});
				}
				return response.sendStatus(401);
			}
			request.params['accountId'] = authResult.payload.accountId;
			request.params['username'] = authResult.payload.username;
			next();
		} catch (err) {
			console.error(err);
			response.sendStatus(401);
			// response status 401 Unthorized
		}
	}
}