import * as chai from 'chai'
import { decorators as d, Request, Response } from '../../app'

@d.controller('/')
class PassthroughController {
    public spyFn: Function

    constructor() {
        this.spyFn = chai.spy()
    }

    @d.GET('/')
    public getSample(@d.request() req: Request, @d.response() res: Response): void {
        this.spyFn(req['user'].accountId, req['user'].username)
        res.sendStatus(200)
    }
}

module.exports = {
    PassthroughController,
}
