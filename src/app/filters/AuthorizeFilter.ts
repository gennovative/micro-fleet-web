import * as express from 'express';

import { AuthAddOn } from '../AuthAddOn';
import { IActionFilter } from '../decorators/filter';
import { lazyInject } from '../decorators/lazyInject';
import { Types as T } from '../Types';


export class AuthorizeFilter implements IActionFilter {

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

	private addReadonlyProp(obj: object, prop: string, value: any): void {
		Object.defineProperty(obj, prop, 
			{
				writable: false,
				enumerable: true,
				configurable: false,
				value
			}
		);
	}
}