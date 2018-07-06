import * as express from 'express';
import { decorators as dec } from '../../app';

@dec.controller('/')
@dec.authorized()
class AuthorizedController {
	@dec.GET('/')
	public getRestricted(req: express.Request, res: express.Response): void {
		res.send('AuthorizedController.getRestricted');
	}
}

module.exports = {
	AuthorizedController
};