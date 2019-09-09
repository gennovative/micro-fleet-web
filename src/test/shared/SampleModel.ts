import * as joi from '@hapi/joi'
import { Translatable, decorators as d } from '@micro-fleet/common'


export class SampleModel extends Translatable {
    @d.required()
    @d.string({ minLength: 1, maxLength: 30 })
    public name: string = undefined

    @d.validateProp(joi.number().greater(18).required())
    public age: number = undefined

    @d.string({ minLength: 1 })
    public position: string = undefined
}
