import * as chai from 'chai'

import { decorators as d, IActionFilter, FilterPriority,
    Request, Response } from '../../app'


class FirstFilter implements IActionFilter {
    public execute(request: Request, response: Response, next: Function): void {
        global['callOrder'].push(3)
        next()
    }
}

class SecondFilter implements IActionFilter {
    public execute(request: Request, response: Response, next: Function): void {
        global['callOrder'].push(2)
        next()
    }
}

class ThirdFilter implements IActionFilter {
    public execute(request: Request, response: Response, next: Function): void {
        global['callOrder'].push(1)
        next()
    }
}

@d.filter(ThirdFilter)
@d.filter(SecondFilter)
@d.filter(FirstFilter)
@d.controller('/same')
class SamePriorityController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.GET('/')
    public doGet(@d.response() res: Response) {
        this.spyFn()
        this.count++
        global['callOrder'].push(0)
        res.sendStatus(200)
    }
}


@d.filter(FirstFilter, FilterPriority.HIGH)
@d.filter(ThirdFilter, FilterPriority.LOW)
@d.filter(SecondFilter, FilterPriority.MEDIUM)
@d.controller('priority')
class PrioritizedController {

    public spyFn: Function

    constructor() {
        this.spyFn = chai.spy()
    }

    @d.GET('/')
    public doGet(@d.response() res: Response) {
        this.spyFn()
        global['callOrder'].push(0)
        res.sendStatus(200)
    }
}

module.exports = {
    SamePriorityController,
    PrioritizedController,
}
