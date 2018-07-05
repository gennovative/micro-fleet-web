import * as express from 'express';
import { controller, GET } from '../../app';

@controller('/')
class PassthroughController {
	@GET('/')
	public getSample(req: express.Request, res: express.Response, next: Function): void {
		next();
	}
}

module.exports = {
	PassthroughController
};