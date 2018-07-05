import * as express from 'express';
import * as web from '../../app';

@web.controller()
class DefaultController {
	@web.GET()
	public doGet(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doGet');
	}

	@web.POST()
	public doPost(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPost');
	}

	@web.PATCH()
	public doPatch(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPatch');
	}

	@web.PUT()
	public doPut(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPut');
	}

	@web.DELETE()
	public doDelete(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doDelete');
	}
}

module.exports = {
	DefaultController
};