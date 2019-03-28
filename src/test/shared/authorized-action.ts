import * as express from 'express'
import { decorators as dec } from '../../app'

@dec.controller('/')
class AuthorizedActionController {
    @dec.GET('/')
    @dec.authorized()
    public getRestricted(req: express.Request, res: express.Response): void {
        res.send('AuthorizedController.getRestricted')
    }

    @dec.DELETE('/')
    public deleteAtWill(req: express.Request, res: express.Response): void {
        res.send('AuthorizedController.deleteAtWill')
    }
}

module.exports = {
    AuthorizedActionController,
}
