import * as chai from 'chai'

import { decorators as d, Request, Response } from '../../app'
import { ModelDecoratorOptions } from '../../app/decorators'

import { SampleModel } from './SampleModel'


@d.controller('/model-auto')
class ModelAutoController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @d.POST('/single')
    public single(
            @d.model() result: SampleModel,
        ) {
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
    }

    @d.PUT('/array-one-item')
    public arrayOne(
            @d.model(SampleModel) results: SampleModel[],
        ) {
        this.spyFn(results.length, results[0].constructor.name,
            results[0].name, results[0].age, results[0].position)
    }

    @d.PUT('/array-many-item')
    public arrayMany(
            @d.model(SampleModel) results: SampleModel[],
        ) {
        this.spyFn(results.length,
            results[0].constructor.name, results[0].name, results[0].age,
            results[1].constructor.name, results[1].name, results[1].age,
            results[2].constructor.name, results[2].name, results[2].age,
        )
    }

    @d.PATCH('/custom')
    public doCustomExtract(
        @d.request() req: Request,
        @d.model(<ModelDecoratorOptions> {
            extractFn: (r: Request) => r.query,
        })
        modelQuery: SampleModel,
        @d.model({
            extractFn: (r: Request) => r.body.model,
        })
        modelBody: SampleModel,
        @d.response() res: Response
    ) {
        this.spyFn(
            modelQuery.constructor.name, modelQuery.name, modelQuery.age, modelQuery.position,
            modelBody.constructor.name, modelBody.name, modelBody.age, modelBody.position,
        )
        res.sendStatus(200)
    }

    @d.PATCH('/:num/postprocess')
    public postProcess(
        @d.model({
            postProcessFn: (m: SampleModel, r: Request) => m.age += parseInt(r.params.num),
        })
        model: SampleModel,
        @d.response() res: Response
    ) {
        this.spyFn(
            model.constructor.name, model.name, model.age, model.position,
        )
        res.sendStatus(200)
    }
}

module.exports = {
    ModelAutoController,
}
