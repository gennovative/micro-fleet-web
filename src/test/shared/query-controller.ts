import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'


@d.controller('/query')
class QueryController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/first')
    public first(
            @d.query('org') orgName: string,
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(orgName, req.query['org'], nothing)
        res.sendStatus(200)
    }

    @d.PUT('/middle')
    public middle(
            nothing: any,
            @d.query('org') orgName: string,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(orgName, req.query['org'], nothing)
        res.sendStatus(200)
    }

    @d.PATCH('/last')
    public last(
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
            @d.query('org') orgName: string,
        ) {
        this.spyFn(orgName, req.query['org'], nothing)
        res.sendStatus(200)
    }

    @d.GET('/list')
    public list(
            @d.request() req: Request,
            @d.response() res: Response,
            @d.query('emp') employeeNames: string[],
        ) {
        this.spyFn(
            employeeNames[0], req.query['emp'][0],
            employeeNames[1], req.query['emp'][1],
            employeeNames[2], req.query['emp'][2],
            employeeNames.length,
        )
        res.sendStatus(200)
    }

    @d.GET('/parse')
    public parse(
            @d.response() res: Response,
            @d.query('nums', Number) numArr: number[],
            @d.query('correct', Boolean) isCorrect: boolean,
        ) {
        this.spyFn(
            Array.isArray(numArr),
            numArr.reduce((prev, cur) => prev && (typeof cur === 'number'), true),
            (typeof isCorrect === 'boolean'),
        )
        res.sendStatus(200)
    }

    @d.GET('/multi')
    public multi(
            @d.query('org') orgName: string,
            @d.request() req: Request,
            @d.query('dept') deptName: string,
            @d.response() res: Response,
            @d.query('emp') employeeName: string,
            nothing: any,
        ) {
        this.spyFn(
            orgName, req.query['org'],
            deptName, req.query['dept'],
            employeeName, req.query['emp'],
            nothing,
        )
        res.sendStatus(200)
    }
}

module.exports = {
    QueryController,
}
