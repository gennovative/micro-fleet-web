/// <reference types="reflect-metadata" />

import { MetaData } from '../constants/MetaData'
import { Request, Response } from '../interfaces'


export type ParseFunction = (input: string) => any

export type DecorateParamOptions = {
    TargetClass: Newable,
    method: string,
    paramIndex: number,
    resolverFn: (req: Request, res: Response) => Promise<any> | any,
}

export type ParamDecorDescriptor = Function[]

/**
 * Stored the `resolverFn` for later use to resolve value for
 * param `paramIndex` of the `method` of `TargetClass`.
 */
export function decorateParam(opts: DecorateParamOptions) {
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
