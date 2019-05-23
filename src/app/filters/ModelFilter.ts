import * as joi from 'joi'
import { Guard, ModelAutoMapper, MinorException } from '@micro-fleet/common'

import { IActionFilter } from '../decorators/filter'
import { Request, Response } from '../interfaces'
import { ActionFilterBase } from './ActionFilterBase'


export type ModelFilterOptions = {
    /**
     * Result object will be instance of this class.
     */
    ModelClass?: Newable

    /**
     * Whether this request contains all properties of model class,
     * or just some of them.
     * Default: false
     */
    isPartial?: boolean

    /**
     * Function to extract model object from request body.
     * As default, model object is extracted from `request.body.model`.
     */
    modelPropFn?: <T extends object = object>(request: Request<T>) => any

    /**
     * Custom validation rule for arbitrary object.
     */
    customValidationRule?: joi.SchemaMap,

    /**
     * If true, this filter attaches tenantId to result object.
     * tenantId should be resolved by `TenantResolverFilter`.
     */
    hasTenantId?: boolean
}

export class ModelFilter
    extends ActionFilterBase
    implements IActionFilter {

    public execute(request: Request, response: Response, next: Function,
            options: ModelFilterOptions): void {
        try {
            const { ModelClass, isPartial, modelPropFn, hasTenantId } = options
            Guard.assertArgDefined('ModelClass', ModelClass)
            Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator'])
            const translator: ModelAutoMapper<any> = ModelClass['translator']
            const func: Function = (!!isPartial) ? translator.partial : translator.whole
            let rawModel
            if (request.body && request.body.model) {
                rawModel = request.body.model
            }
            else if (typeof modelPropFn === 'function') {
                rawModel = modelPropFn(request)
            }
            else {
                throw new MinorException('Request body must have property "model".')
            }
            if (hasTenantId && typeof rawModel === 'object') {
                rawModel.tenantId = request.extras.tenantId
            }
            const model = func.call(translator, rawModel)
            this.addReadonlyProp(request.extras, 'model', model)
            next()
        } catch (err) {
            next(err)
        }
    }
}
