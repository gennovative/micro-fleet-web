import * as chai from 'chai'

import { decorators, Request, Response } from '../../app'
const { model, controller, POST, PATCH, PUT, response, request } = decorators

import { SampleModel } from './SampleModel'


@controller('/model')
class ModelController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @POST('/first')
    public first(
            @model(SampleModel) result: SampleModel,
            @response() res: Response,
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @POST('/valid')
    public doValid(
            req: Request<SampleModel>,
            @response() res: Response,
            @model(SampleModel) result: SampleModel,
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @PATCH('/custom')
    public doCustom(
            @request() req: Request<SampleModel>,
            @model({
                ModelClass: SampleModel,
                modelPropFn: (r: Request) => r.body,
            })
            result: SampleModel,
            @response() res: Response
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @PUT('/partial')
    public doPartial(
            req: Request<SampleModel>,
            @model({
                ModelClass: SampleModel,
                isPartial: true,
            })
            result: SampleModel,
            @response() res: Response
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @POST('/invalid')
    // @filter(ModelFilter, FilterPriority.MEDIUM, {
    //     ModelClass: SampleModel,
    //     modelPropFn: (req: any) => req.body,
    // })
    public doInvalid(
            @model(SampleModel) result: SampleModel,
            @response() res: Response,
        ) {
        this.spyFn()
        res.sendStatus(200)
    }
}

module.exports = {
    ModelController,
}
