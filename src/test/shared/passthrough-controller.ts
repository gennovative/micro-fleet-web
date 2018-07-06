import * as express from 'express';
import * as chai from 'chai';
import { decorators as dec } from '../../app';

@dec.controller('/')
class PassthroughController {
	public spyFn: Function;

	constructor() {
		this.spyFn = chai.spy();
	}

	@dec.GET('/')
	public getSample(req: express.Request, res: express.Response): void {
		this.spyFn(req['auth'].accountId, req['auth'].username);
		res.sendStatus(200);
	}
}

module.exports = {
	PassthroughController
};