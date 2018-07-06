import * as express from 'express';
import { decorators as dec } from '../../app';

@dec.controller()
class DefaultController {
	@dec.GET()
	public doGet(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doGet');
	}

	@dec.POST()
	public doPost(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPost');
	}

	@dec.PATCH()
	public doPatch(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPatch');
	}

	@dec.PUT()
	public doPut(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doPut');
	}

	@dec.DELETE()
	public doDelete(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doDelete');
	}

	@dec.HEAD()
	public doHead(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doHead');
	}

	@dec.OPTIONS()
	public doOptions(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doOptions');
	}

	@dec.GET()
	@dec.POST()
	@dec.PATCH()
	@dec.PUT()
	@dec.DELETE()
	@dec.HEAD()
	@dec.OPTIONS()
	public doMany(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doMany');
	}

	@dec.ALL()
	public doAll(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doAll');
	}

	/**
	 * Intentionally no action decorator
	 */
	public doSecret(req: express.Request, res: express.Response): void {
		res.send('DefaultController.doSecret');
	}
}

module.exports = {
	DefaultController
};