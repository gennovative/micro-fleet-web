import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


export type QueryDecorator = (name: string, parseFn?: ParseFunction) => Function


function getQueryString(req: Request, name: string, parseFn?: ParseFunction): string | string[] {
    const parseItem = (r: string) => parseFn ? parseFn(r) : r
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
export function query(name: string, parseFn?: ParseFunction): Function {
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
