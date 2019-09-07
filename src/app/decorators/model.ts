import { Guard, IModelAutoMapper, MinorException, ITranslatable, Result } from '@micro-fleet/common'

import { Request } from '../interfaces'
import { decorateParam, ParseFunction, getParamType } from './param-decor-base'


export type ModelDecoratorOptions = {

    /**
     * Function to extract model object from request body.
     */
    extractFn?: <T extends object = object>(request: Request<T>) => any

    /**
     * Turns on or off model validation before translating.
     * Default to use translator's `enableValidation` property.
     */
    enableValidation?: boolean,

    /**
     * Whether this request contains just some properties of model class.
     * Default: false (request contains all props)
     */
    isPartial?: boolean

    /**
     * If the expected model is an array, the array item type must
     * be specified here.
     */
    ItemClass?: ITranslatable

    /**
     * If true, will attempt to resolve tenantId from `request.extras`
     * then attach to the result model.
     */
    hasTenantId?: boolean,
}


export type ModelDecorator = (opts: ITranslatable | ModelDecoratorOptions) => Function


/**
 * For action parameter decoration.
 * Attempts to translate request body to desired model class,
 * then attaches to the parameter's value.
 * @param opts Can be the Model Class or option object.
 */
export function model(opts: ITranslatable | ModelDecoratorOptions = {}): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): Function {
        if (typeof opts === 'function') {
            opts = {
                ItemClass: opts,
            }
        }

        let rsParser: Result<ParseFunction>
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => {
                rsParser = rsParser || modelParserFactory(proto, method, paramIndex, opts as ModelDecoratorOptions)
                rsParser.throwError()
                return translateModel(request, opts as ModelDecoratorOptions, rsParser.value)
            },
        })
        return proto
    }
}

export async function translateModel(req: Request, options: ModelDecoratorOptions, parse: ParseFunction): Promise<object> {
    const { extractFn, hasTenantId } = options
    if (!extractFn && req.body == null) {
        throw new MinorException('Request must have property "body". Otherwise, you must provide "extractFn" in decorator option.')
    }
    const rawModel = Boolean(extractFn) ? extractFn(req) : req.body
    if (rawModel != null) {
        const resultModel = parse(rawModel)
        hasTenantId && (resultModel.tenantId = req.extras.tenantId)
        return resultModel
    }
    return rawModel
}


/**
 * Selects a function to parse request body to model object.
 */
function modelParserFactory(proto: any, method: string | symbol, paramIndex: number, opts: ModelDecoratorOptions): Result<ParseFunction> {
    const ModelClass = getParamType(proto, method, paramIndex)
    const { ItemClass, isPartial } = opts
    const translateOpt = (opts.enableValidation != null)
        ? { enableValidation: opts.enableValidation}
        : null
    const errPrefix = `In ${proto.constructor.name}.${method as string}:`

    if (ModelClass === Array) {
        return Result.Ok(toArray(ItemClass, isPartial, translateOpt, errPrefix))
    }
    else if (typeof ModelClass['getTranslator'] === 'function') {
        return Result.Ok(translate(ModelClass as any, isPartial, translateOpt, errPrefix))
    }
    else if (ItemClass) {
        return Result.Ok(translate(ItemClass, isPartial, translateOpt, errPrefix))
    }
    return Result.Failure(`${errPrefix} Cannot automatically infer model type. ItemClass must be specified.`)
}

function toArray(ItemClass: ITranslatable, isPartial: boolean, translateOpt: any, errPrefix: string): ParseFunction {
    return function (rawModel: any) {
        if (Array.isArray(rawModel) && ItemClass) {
            return rawModel.map(translate(ItemClass, isPartial, translateOpt, errPrefix))
        }
        else if (ItemClass) {
            // Wrap single value of one-item array
            return [translate(ItemClass, isPartial, translateOpt, errPrefix)(rawModel)]
        }
        throw new MinorException(`${errPrefix} Cannot automatically infer model type. ItemClass must be specified.`)
    }
}

function translate(Class: ITranslatable, isPartial: boolean, translateOpt: any, errPrefix: string): ParseFunction {
    return function (raw: any) {
        Guard.assertIsDefined(Class.getTranslator, `${errPrefix} ItemClass must be translatable (by either extending class Translatable`
            + ' or decorated with @translatable())')
        const translator: IModelAutoMapper<any> = Class.getTranslator()
        const func: Function = Boolean(isPartial) ? translator.partial : translator.whole
        return func.call(translator, raw, translateOpt)
    }
}
