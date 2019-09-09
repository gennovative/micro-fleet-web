import { Request } from '../interfaces'
import { decorateParam, ParseFunction, primitiveParserFactory } from './param-decor-base'


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
export function query(name?: string, parseFn?: ParseFunction): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        function resolverFn(request: Request) {
            parseFn = parseFn || primitiveParserFactory(proto, method, paramIndex)
            return getQueryString(request, name, parseFn)
        }

        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? resolverFn : allQuery,
        })
    }
}


function getQueryString(req: Request, name?: string, parseFn?: ParseFunction): any {
    const raw: string | string[] = req.query[name]
    if (Array.isArray(raw)) {
        return raw.map(parseFn)
    }
    return parseFn(raw)
}

function allQuery(req: Request) {
    return req.query
}
