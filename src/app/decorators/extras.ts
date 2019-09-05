import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with selected property from `request.extras`.
 *
 * @param {string} name A key whose value will be extracted from `request.extras`.
 *     If not specified, the whole object will be returned, equivalent to `request.extras`.
 * @param {Function} parseFn Function to parse extracted value to expected data type.
 *     This parameter is ignored if `name` is not specified.
 */
export type ExtrasDecorator = (name?: string, parseFn?: ParseFunction) => Function


function getExtras(req: Request, name?: string, parseFn?: ParseFunction): any {
    if (!name) { return req.params }
    return parseFn ? parseFn(req.params[name]) : req.params[name]
}

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with selected property from `request.extras`.
 */
export function extras(name?: string, parseFn?: ParseFunction): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getExtras(request, name, parseFn),
        })
        return proto
    }
}
