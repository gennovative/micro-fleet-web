import { Request } from '../interfaces'
import { decorateParam, ParseFunction, primitiveParserFactory } from './param-decor-base'


/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.headers`.
 * @param {string} name Case-insensitive header name.
 *    If not specified, the deserialized headers object will be returned, equivalent to `request.headers`.
 * @param {ParseFunction} parseFn Function to parse the value or array items.
 *    If not given, a default function will attempt to parse based on param type.
 *    This parameter is ignored if `name` is not specified.
 * @param {string} listDelimiter If provided, use this as delimiter to split the value to array or strings.
 *     This parameter is ignored if `name` is not specified.
 */
export function header(name?: string, parseFn?: ParseFunction, listDelimiter?: string): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        function resolverFn(request: Request) {
            parseFn = parseFn || primitiveParserFactory(proto, method, paramIndex)
            return getHeader(request, name, parseFn, listDelimiter)
        }

        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? resolverFn : allHeaders,
        })
    }
}

function getHeader(req: Request, name: string, parse?: ParseFunction,
        listDelimiter?: string): string | string[] {
    const raw: string | string[] = req.header(name)
    if (Array.isArray(raw)) {
        return raw.map(parse)
    }
    else if (listDelimiter) {
        return raw.split(listDelimiter).map(parse)
    }
    return parse(raw)
}

function allHeaders(req: Request) {
    return req.headers
}
