import * as express from 'express'
import { decorators as dec } from '../../app'

@dec.controller('custom')
class CustomController {
    @dec.GET('get-it')
    public doGet(req: express.Request, res: express.Response): void {
        res.send('CustomController.doGet')
    }

    @dec.POST('post-it/')
    public doPost(req: express.Request, res: express.Response): void {
        res.send('CustomController.doPost')
    }

    @dec.PATCH('/patch-it')
    public doPatch(req: express.Request, res: express.Response): void {
        res.send('CustomController.doPatch')
    }

    @dec.PUT('/put-it/')
    public doPut(req: express.Request, res: express.Response): void {
        res.send('CustomController.doPut')
    }

    @dec.DELETE('/del-it/')
    public doDelete(req: express.Request, res: express.Response): void {
        res.send('CustomController.doDelete')
    }

    @dec.HEAD('head-it')
    public doHead(req: express.Request, res: express.Response): void {
        res.send('CustomController.doHead')
    }

    @dec.OPTIONS('/opt-it')
    public doOptions(req: express.Request, res: express.Response): void {
        res.send('CustomController.doOptions')
    }

    @dec.GET('get-many')
    @dec.POST('post-many/')
    @dec.PATCH('/patch-many')
    @dec.PUT('/put-many/')
    @dec.DELETE('/del-many/')
    @dec.HEAD('head-many')
    @dec.OPTIONS('/opt-many')
    public doMany(req: express.Request, res: express.Response): void {
        res.send('CustomController.doMany')
    }

    @dec.ALL('/do-all')
    public doAll(req: express.Request, res: express.Response): void {
        res.send('CustomController.doAll')
    }
}

module.exports = {
    CustomController,
}
