import * as chai from 'chai'

import { decorators as d, Response } from '../../app'


@d.controller('respond')
class RespondingController {

    public spyFn: Function

    constructor() {
        this.spyFn = chai.spy()
    }

    @d.GET('/auto-sync')
    public getAutoSync(): string {
        this.spyFn()
        return 'RespondingController.getAutoSync'
    }

    @d.PUT('/auto-async')
    public getAutoAsync(): Promise<any> {
        this.spyFn()
        return Promise.resolve({
            info: 'RespondingController.getAutoAsync',
        })
    }

    @d.PATCH('/auto-sync-error')
    public getAutoFailSync(): string {
        this.spyFn()
        throw 1234567890
    }

    @d.POST('/auto-async-error')
    public getAutoFailAsync(): Promise<any> {
        this.spyFn()
        return Promise.reject({
            reason: 'RespondingController.getAutoFailAsync',
        })
    }


    @d.GET('/manual-sync')
    public getManualSync(@d.response() res: Response): void {
        this.spyFn()
        res.send('RespondingController.getManualSync')
    }

    @d.PUT('/manual-async')
    public getManualAsync(@d.response() res: Response): void {
        this.spyFn()
        setTimeout(() => {
            res.send({
                info: 'RespondingController.getManualAsync',
            })
        }, 100)
    }

    @d.PATCH('/manual-sync-error')
    public getManualFailSync(@d.response() res: Response): void {
        this.spyFn()
        const msg = '1234567890'
        res.status(500).send(Buffer.alloc(msg.length, msg))
    }

    @d.POST('/manual-async-error')
    public getManualFailAsync(@d.response() res: Response): void {
        this.spyFn()
        setTimeout(() => {
            res.status(502).json({
                reason: 'RespondingController.getManualFailAsync',
            })
        }, 100)
    }
}

module.exports = {
    RespondingController,
}
