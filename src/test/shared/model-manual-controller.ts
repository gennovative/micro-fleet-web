import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'
import { ModelDecoratorOptions } from '../../app/decorators'

import { SampleModel } from './SampleModel'


@d.controller('/model-manual')
class ModelManualController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/first')
    public first(
        @d.model(SampleModel) result: SampleModel,
        @d.response() res: Response,
    ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @d.POST('/valid')
    public doValid(
            req: Request,
            @d.response() res: Response,
            @d.model(SampleModel) result: SampleModel,
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @d.PATCH('/custom')
    public doCustomExtract(
            @d.request() req: Request,
            @d.model(<ModelDecoratorOptions> {
                ItemClass: SampleModel,
                extractFn: (r: Request) => r.body.one,
            })
            modelOne: SampleModel,
            @d.model({
                ItemClass: SampleModel,
                extractFn: (r: Request) => r.body.two,
            })
            modelTwo: SampleModel,
            @d.response() res: Response
        ) {
        this.spyFn(
            modelOne.constructor.name, modelOne.name, modelOne.age, modelOne.position,
            modelTwo.constructor.name, modelTwo.name, modelTwo.age, modelTwo.position,
        )
        res.sendStatus(200)
    }

    @d.PUT('/partial')
    public doPartial(
            req: Request,
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
    public doInvalid(
            @d.model(SampleModel) result: SampleModel,
            @d.response() res: Response,
        ) {
        this.spyFn()
        res.sendStatus(200)
    }
}

module.exports = {
    ModelManualController,
}
