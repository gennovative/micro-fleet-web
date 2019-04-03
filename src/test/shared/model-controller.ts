import * as chai from 'chai'

import { ModelFilter, FilterPriority, decorators, Request, Response } from '../../app'
const { filter, model, controller, POST } = decorators
import { SampleModel } from './SampleModel'


@controller('/')
class ModelController {

    public spyFn: Function
    public count: number

    constructor() {
        this.spyFn = chai.spy()
        this.count = 0
    }

    @POST('/valid')
    @model({
        ModelClass: SampleModel,
    })
    public doValid(req: Request<SampleModel>, res: Response) {
        const result = req.model
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @POST('/custom')
    @model({
        ModelClass: SampleModel,
        modelPropFn: (req) => req.body,
    })
    public doCustom(req: Request<SampleModel>, res: Response) {
        const result: any = req.model
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @POST('/partial')
    @model({
        ModelClass: SampleModel,
        isPartial: true,
    })
    public doPartial(req: Request<SampleModel>, res: Response) {
        const result: any = req.model
        this.spyFn(result.constructor.name, result.name, result.age, result.position)
        res.sendStatus(200)
    }

    @POST('/invalid')
    @filter(ModelFilter, FilterPriority.MEDIUM, {
        ModelClass: SampleModel,
        modelPropFn: (req: any) => req.body,
    })
    public doInvalid(req: Request, res: Response) {
        this.spyFn()
        res.sendStatus(200)
    }
}

module.exports = {
    ModelController,
}
