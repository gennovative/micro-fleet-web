import { Request } from '../interfaces'
import { decorateParam, ParseFunction, primitiveParserFactory } from './param-decor-base'


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
export function param(name?: string, parseFn?: ParseFunction): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        function resolverFn(request: Request) {
            parseFn = parseFn || primitiveParserFactory(proto, method, paramIndex)
            return parseFn(request.params[name])
        }

        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? resolverFn : req => req.params,
        })
    }
}
