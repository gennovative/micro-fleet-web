import * as express from 'express';
import { controller, GET } from '../../app';

@controller('/')
class SampleController {
	@GET('/')
	public getSample(req: express.Request, res: express.Response): void {
		res.send('SampleController.getSample');
	}
}

module.exports = {
	SampleController
};