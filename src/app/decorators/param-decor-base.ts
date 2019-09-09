/// <reference types="reflect-metadata" />
import { Newable, Guard } from '@micro-fleet/common'

import { MetaData } from '../constants/MetaData'
import { Request, Response } from '../interfaces'


/**
 * This is the meta key that TypeScript automatically decorates.
 */
const PARAM_TYPE_META = 'design:paramtypes'

export type ParseFunction = (input: any) => any

export type DecorateParamOptions = {
    /**
     * The class that has the method to which the decorated parameter belongs.
     */
    TargetClass: Newable,

    /**
     * The function name whose signature contains the decorated parameter.
     */
    method: string | symbol,

    /**
     * Position of the decorated parameter in function signature.
     */
    paramIndex: number,

    /**
     * The function to figure out the value for the decorated parameter
     */
    resolverFn: (req: Request, res: Response) => Promise<any> | any,
}

export type ParamDecorDescriptor = Function[]

/**
 * Stored the `resolverFn` for later use to resolve value for
 * param `paramIndex` of the `method` of `TargetClass`.
 */
export function decorateParam(opts: DecorateParamOptions) {
    Guard.assertIsTruthy(opts.method, 'This decorator is for action method inside controller class')
    const args: any = [MetaData.PARAM_DECOR, opts.TargetClass, opts.method]
    let paramDesc: ParamDecorDescriptor
    if (Reflect.hasOwnMetadata.apply(Reflect, args)) {
        paramDesc = Reflect.getOwnMetadata.apply(Reflect, args)
    } else {
        paramDesc = []
    }
    paramDesc[opts.paramIndex] = opts.resolverFn
    Reflect.defineMetadata(MetaData.PARAM_DECOR, paramDesc, opts.TargetClass, opts.method)
}

export function getParamType(proto: any, method: string | symbol, paramIndex: number): any {
    // Expected: ===========================v
    // __metadata("design:paramtypes", [Number, String, Object]),
    const paramTypes = Reflect.getOwnMetadata(PARAM_TYPE_META, proto, method) || []
    return paramTypes[paramIndex]
}

export function identity(val: any): any {
    return val
}

export function primitiveParserFactory(proto: any, method: string | symbol, paramIndex: number): ParseFunction {
    const targetType = getParamType(proto, method, paramIndex)
    switch (targetType) {
        case Number:
            // Number(rawModel) is a valid casting
            return targetType as ParseFunction
        case Boolean:
            return function(rawModel: any) {
                if (!rawModel || rawModel === 'false' || rawModel === '0') {
                    return false
                }
                return true
            }
        case Object:
            return function(rawModel: any) {
                if (typeof rawModel === 'string') {
                    return JSON.parse(rawModel)
                }
                return Object(rawModel)
            }
        default:
            return identity
    }
}
