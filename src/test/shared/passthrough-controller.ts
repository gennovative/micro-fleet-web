import * as chai from 'chai'
import { decorators as dec, Request, Response } from '../../app'

@dec.controller('/')
class PassthroughController {
    public spyFn: Function

    constructor() {
        this.spyFn = chai.spy()
    }

    @dec.GET('/')
    public getSample(req: Request, res: Response): void {
        this.spyFn(req['user'].accountId, req['user'].username)
        res.sendStatus(200)
    }
}

module.exports = {
    PassthroughController,
}
