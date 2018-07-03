import * as express from 'express';
import { controller, action } from '../../app';

@controller('/')
class SampleController {
	@action('get', '/')
	public getSample(req: express.Request, res: express.Response): void {
		res.send('SampleController.getSample');
	}
}

module.exports = {
	SampleController
};