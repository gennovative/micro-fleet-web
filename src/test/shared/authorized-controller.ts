import * as express from 'express';
import { controller, GET, authorized } from '../../app';

@controller('/')
@authorized()
class AuthorizedController {
	@GET('/')
	public getRestricted(req: express.Request, res: express.Response): void {
		res.send('AuthorizedController.getRestricted');
	}
}

module.exports = {
	AuthorizedController
};