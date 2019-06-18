import { Request } from '../interfaces'
import { decorateParam, ParseFunction } from './param-decor-base'


export type HeaderDecorator = (name: string, parseFn?: ParseFunction, listDelimiter?: string) => Function


export function getHeader(req: Request, name: string, parseFn?: ParseFunction,
        listDelimiter?: string): string | string[] {
    const parseItem = (r: string) => parseFn ? parseFn(r) : r
    const raw: string | string[] = req.header(name)
    if (Array.isArray(raw)) {
        return raw.map(parseItem)
    }
    else if (listDelimiter) {
        return raw.split(listDelimiter).map(parseItem)
    }
    return parseItem(raw)
}

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.params`.
 * @param {string} name Case-insensitive header name
 * @param {ParseFunction} parseFn Function to parse the value or array item
 * @param {string} listDelimiter If provided, use this as delimiter to split
 *      the value to array or strings.
 */
export function header(name: string, parseFn?: ParseFunction, listDelimiter?: string): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => getHeader(request, name, parseFn, listDelimiter),
        })
        return proto
    }
}
