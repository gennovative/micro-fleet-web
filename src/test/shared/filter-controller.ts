import * as express from 'express';
import * as chai from 'chai';

import { IActionFilter, decorators, FilterPriority } from '../../app';
const { filter, controller, GET } = decorators;


class FirstFilter implements IActionFilter {
	execute(request: any, response: any, next: Function): void {
		global['callOrder'].push(3);
		next();
	}
}

class SecondFilter implements IActionFilter {
	execute(request: any, response: any, next: Function): void {
		global['callOrder'].push(2);
		next();
	}
}

class ThirdFilter implements IActionFilter {
	execute(request: any, response: any, next: Function): void {
		global['callOrder'].push(1);
		next();
	}
}

@filter(ThirdFilter)
@filter(SecondFilter)
@filter(FirstFilter)
@controller('/same')
class SamePriorityController {

	public spyFn: Function;
	public count: number;

	constructor() {
		this.spyFn = chai.spy();
		this.count = 0;
	}

	@GET('/')
	public doGet(req: express.Request, res: express.Response) {
		this.spyFn();
		this.count++;
		global['callOrder'].push(0);
		res.sendStatus(200);
	}
}


@filter(FirstFilter, FilterPriority.HIGH)
@filter(ThirdFilter, FilterPriority.LOW)
@filter(SecondFilter, FilterPriority.MEDIUM)
@controller('priority')
class PrioritizedController {

	public spyFn: Function;

	constructor() {
		this.spyFn = chai.spy();
	}

	@GET('/')
	public doGet(req: express.Request, res: express.Response) {
		this.spyFn();
		global['callOrder'].push(0);
		res.sendStatus(200);
	}
}

module.exports = {
	SamePriorityController,
	PrioritizedController,
};