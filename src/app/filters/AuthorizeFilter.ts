import * as express from 'express';
import { lazyInject } from '@micro-fleet/common';

import { AuthAddOn } from '../AuthAddOn';
import { IActionFilter } from '../decorators/filter';
import { Types as T } from '../Types';
import { ActionFilterBase } from './ActionFilterBase';


export class AuthorizeFilter 
	extends ActionFilterBase
	implements IActionFilter {

	@lazyInject(T.AUTH_ADDON) private _authAddon: AuthAddOn;

	public async execute(request: express.Request, response: express.Response, next: Function): Promise<any> {
		try {
			const authResult = await this._authAddon.authenticate(request, response, next);
			if (!authResult.payload) {
				return response.status(401).send(authResult.info.message);
			}

			const auth: any = {};
			this.addReadonlyProp(auth, 'accountId', authResult.payload.accountId);
			this.addReadonlyProp(auth, 'username', authResult.payload.username);
			this.addReadonlyProp(request, 'auth', auth);
			next();
		} catch (err) {
			console.error(err);
			response.sendStatus(401);
			// response status 401 Unthorized
		}
	}
}