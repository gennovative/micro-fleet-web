import { Request } from '../interfaces'
import { decorateParam, ParseFunction, primitiveParserFactory } from './param-decor-base'


export type HeaderDecorator = (name: string, parseFn?: ParseFunction, listDelimiter?: string) => Function


export function getHeader(req: Request, name: string, parse?: ParseFunction,
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

/**
 * For action parameter decoration.
 * Will resolve the parameter's value with header value from `request.params`.
 * @param {string} name Case-insensitive header name
 * @param {ParseFunction} parseFn Function to parse the value or array item.
 *    If not given, a default function will attempt to parse based on param type.
 * @param {string} listDelimiter If provided, use this as delimiter to split
 *      the value to array or strings.
 */
export function header(name: string, parseFn?: ParseFunction, listDelimiter?: string): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (request) => {
                return getHeader(
                    request,
                    name,
                    parseFn || primitiveParserFactory(proto, method, paramIndex),
                    listDelimiter,
                )
            },
        })
    }
}
