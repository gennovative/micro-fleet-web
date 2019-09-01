import * as joi from 'joi'
import { Guard, IModelAutoMapper, MinorException, Newable } from '@micro-fleet/common'

import { Request } from '../interfaces'
import { decorateParam } from './param-decor-base'


/*
 * Attempts to translate request body to desired model class.
 * @deprecated
 */
// function modelAction(opts: ModelFilterOptions): Function {
//     return function (TargetClass: Newable, key: string): Function {
//         TargetClass = addFilterToTarget<ModelFilter>(ModelFilter, TargetClass, key, FilterPriority.MEDIUM, opts) as Newable
//         return TargetClass
//     }
// }


export type ModelDecoratorOptions = {
    /**
     * Result object will be instance of this class.
     */
    ModelClass?: Newable

    /**
     * Whether this request contains just some properties of model class.
     * Default: false (request contains all props)
     */
    isPartial?: boolean

    /**
     * Function to extract model object from request body.
     * As default, model object is extracted from `request.body.model`.
     */
    extractFn?: <T extends object = object>(request: Request<T>) => any

    /**
     * Custom validation rule for arbitrary object.
     */
    customValidationRule?: joi.SchemaMap,

    /**
     * If true, will attempt to resolve tenantId from request.params
     * then attach to the result object.
     */
    hasTenantId?: boolean,

    /**
     * Turns on or off model validation before translating.
     * Default to use translator's `enableValidation` property.
     */
    enableValidation?: boolean,
}


export type ModelDecorator = (opts: Newable | ModelDecoratorOptions) => Function

export async function extractModel(req: Request, options: ModelDecoratorOptions): Promise<object> {

    const { ModelClass, isPartial, extractFn, hasTenantId } = options
    const translateOpt = (options.enableValidation != null)
        ? { enableValidation: options.enableValidation}
        : null
    if (!extractFn && req.body.model == null) {
        throw new MinorException('Request must have property "body.model". Otherwise, you must provide "extractFn" in decorator option.')
    }
    const rawModel = Boolean(extractFn) ? extractFn(req) : req.body.model
    hasTenantId && (rawModel.tenantId = req.extras.tenantId)

    if (typeof rawModel === 'object' && ModelClass) {
        Guard.assertArgDefined(`${ModelClass}.translator`, ModelClass['translator'])
        const translator: IModelAutoMapper<any> = ModelClass['translator']
        const func: Function = Boolean(isPartial) ? translator.partial : translator.whole
        return func.call(translator, rawModel, translateOpt)
    }
    return rawModel
}


/**
 * For action parameter decoration.
 * Attempts to translate request body to desired model class,
 * then attaches to the parameter's value.
 * @param opts Can be the Model Class or option object.
 */
export function model(opts: Newable | ModelDecoratorOptions): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        if (typeof opts === 'function') {
            opts = {
                ModelClass: opts,
            }
        }
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => extractModel(request, opts as ModelDecoratorOptions),
        })
        return proto
    }
}
