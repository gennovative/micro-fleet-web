import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with query string value from `request.query`.
 *
 * @param {string} name A key whose value will be extracted from query string.
 *     If not specified, the deserialized query object will be returned, equivalent to `request.query`.
 * @param {Function} parseFn Function to parse extracted value to expected data type.
 *     This parameter is ignored if `name` is not specified.
 */
export type QueryDecorator = (name?: string, parseFn?: ParseFunction) => Function


function getQueryString(req: Request, name?: string, parseFn?: ParseFunction): any {
    const parseItem = (r: string) => parseFn ? parseFn(r) : r
    if (!name) { return req.query }

    const raw: string | string[] = req.query[name]
    if (Array.isArray(raw)) {
        return raw.map(parseItem)
    }
    return parseItem(raw)
}

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with query string value from `request.params`.
 */
export function query(name?: string, parseFn?: ParseFunction): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getQueryString(request, name, parseFn),
        })
        return proto
    }
}
