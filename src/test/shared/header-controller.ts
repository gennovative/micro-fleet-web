import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'


@d.controller('/header')
class HeaderController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/first')
    public first(
            @d.header('AUTHORIZATION') token: string,
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(token, req.header('AUTHORIZATION'), nothing)
        res.sendStatus(200)
    }

    @d.PUT('/middle')
    public middle(
            nothing: any,
            @d.header('AUTHORIZATION') token: string,
            @d.request() req: Request,
            @d.response() res: Response,
        ) {
        this.spyFn(token, req.header('AUTHORIZATION'), nothing)
        res.sendStatus(200)
    }

    @d.PATCH('/last')
    public last(
            nothing: any,
            @d.request() req: Request,
            @d.response() res: Response,
            @d.header('AUTHORIZATION') token: string,
        ) {
        this.spyFn(token, req.header('AUTHORIZATION'), nothing)
        res.sendStatus(200)
    }

    @d.GET('/list')
    public list(
            @d.request() req: Request,
            @d.response() res: Response,
            @d.header('x-list', null, ';') list: string[],
        ) {
        const fromHeader = req.header('x-list').split(';')
        this.spyFn(
            list[0], fromHeader[0],
            list[1], fromHeader[1],
            list[2], fromHeader[2],
            list.length,
        )
        res.sendStatus(200)
    }

    @d.GET('/parse')
    public parse(
            @d.response() res: Response,
            @d.header('x-nums', Number, '@') numArr: number[],
            @d.header('x-correct', Boolean) isCorrect: boolean,
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
            @d.header('AUTHORIZATION') token: string,
            @d.request() req: Request,
            @d.header('Host') host: string,
            @d.response() res: Response,
            @d.header('Content-Type') contentType: string,
            nothing: any,
        ) {
        this.spyFn(
            token, req.header('AUTHORIZATION'),
            host, req.header('Host'),
            contentType, req.header('Content-Type'),
            nothing,
        )
        res.sendStatus(200)
    }
}

module.exports = {
    HeaderController,
}
