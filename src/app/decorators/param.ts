import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with a route params from `request.params`.
 *
 * @param {string} name A key whose value will be extracted from route params.
 *     If not specified, the deserialized params object will be returned, equivalent to `request.params`.
 * @param {Function} parseFn Function to parse extracted value to expected data type.
 *     This parameter is ignored if `name` is not specified.
 */
export type ParamDecorator = (name?: string, parseFn?: ParseFunction) => Function


function getRouteParam(req: Request, name?: string, parseFn?: ParseFunction): any {
    if (!name) { return req.params }
    return parseFn ? parseFn(req.params[name]) : req.params[name]
}

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with a route params from `request.params`.
 */
export function param(name?: string, parseFn?: ParseFunction): Function {
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
