import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'

import { SampleModel } from './SampleModel'


@d.controller('/param-decor')
class ParamDecorController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/first/:org')
    public first(
            @d.model(SampleModel) result: SampleModel,
            @d.param('org') company: string,
            @d.header('host') host: string,
            @d.query('dept') department: string,
            @d.response() res: Response,
        ) {
        this.spyFn(
            result.constructor.name,
            company,
            host,
            department
        )
        res.sendStatus(200)
    }

    @d.POST('/valid')
    public doValid(
            req: Request<SampleModel>,
            @d.response() res: Response,
            @d.model(SampleModel) result: SampleModel,
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @d.PATCH('/custom')
    public doCustom(
            @d.request() req: Request<SampleModel>,
            @d.model({
                ItemClass: SampleModel,
                extractFn: (r: Request) => r.body,
            })
            result: SampleModel,
            @d.response() res: Response
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @d.PUT('/partial')
    public doPartial(
            req: Request<SampleModel>,
            @d.model({
                ItemClass: SampleModel,
                isPartial: true,
            })
            result: SampleModel,
            @d.response() res: Response
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @d.POST('/invalid')
    // @d.filter(ModelFilter, FilterPriority.MEDIUM, {
    //     ModelClass: SampleModel,
    //     modelPropFn: (req: any) => req.body,
    // })
    public doInvalid(
            @d.model(SampleModel) result: SampleModel,
            @d.response() res: Response,
        ) {
        this.spyFn()
        res.sendStatus(200)
    }
}

module.exports = {
    ParamDecorController,
}
