import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


export type ParamDecorator = (name: string, parseFn?: ParseFunction) => Function


export function getRouteParam(req: Request, name: string, parseFn?: ParseFunction): string {
    return parseFn ? parseFn(req.params[name]) : req.params[name]
}

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with a route params from `request.params`.
 */
export function param(name: string, parseFn?: ParseFunction): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getRouteParam(request, name, parseFn),
        })
        return proto
    }
}
