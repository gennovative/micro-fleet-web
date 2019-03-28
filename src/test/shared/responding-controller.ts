import * as express from 'express'
import { decorators as dec } from '../../app'


@dec.controller('/')
class SampleController {
    @dec.GET('/')
    public getSample(req: express.Request, res: express.Response): void {
        res.send('SampleController.getSample')
    }
}

module.exports = {
    SampleController,
}
