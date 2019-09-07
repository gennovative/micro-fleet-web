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

    @d.GET(':year/multi/:selected')
    public multi(
            @d.param('org') orgName: string,
            @d.request() req: Request,
            @d.param('year') year: number,
            @d.response() res: Response,
            @d.param('selected') isSelected: boolean,
            nothing: any,
        ) {
        this.spyFn(
            typeof orgName, req.params['org'],
            typeof year, req.params['year'],
            typeof isSelected, req.params['selected'],
            nothing,
        )
        res.sendStatus(200)
    }
}

module.exports = {
    ParamController,
}
