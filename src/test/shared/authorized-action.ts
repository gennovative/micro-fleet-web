import * as express from 'express';
import { controller, GET, DELETE, authorized } from '../../app';

@controller('/')
class AuthorizedActionController {
	@GET('/')
	@authorized()
	public getRestricted(req: express.Request, res: express.Response): void {
		res.send('AuthorizedController.getRestricted');
	}

	@DELETE('/')
	public deleteAtWill(req: express.Request, res: express.Response): void {
		res.send('AuthorizedController.deleteAtWill');
	}
}

module.exports = {
	AuthorizedActionController
};