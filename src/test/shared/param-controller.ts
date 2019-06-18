import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'


@d.controller('/param')
class ParamController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/first')
    public first(
            @d.param('org') orgName: string,
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(orgName, req.params['org'], nothing)
        res.sendStatus(200)
    }

    @d.PUT('/middle')
    public middle(
            nothing: any,
            @d.param('org') orgName: string,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(orgName, req.params['org'], nothing)
        res.sendStatus(200)
    }

    @d.PATCH('/last')
    public last(
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
            @d.param('org') orgName: string,
        ) {
        this.spyFn(orgName, req.params['org'], nothing)
        res.sendStatus(200)
    }

    @d.GET(':dept/multi/:emp')
    public multi(
            @d.param('org') orgName: string,
            @d.request() req: Request,
            @d.param('dept') deptName: string,
            @d.response() res: Response,
            @d.param('emp') employeeName: string,
            nothing: any,
        ) {
        this.spyFn(
            orgName, req.params['org'],
            deptName, req.params['dept'],
            employeeName, req.params['emp'],
            nothing,
        )
        res.sendStatus(200)
    }
}

module.exports = {
    ParamController,
}
