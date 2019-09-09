import { Request } from '../interfaces'
import { decorateParam } from './param-decor-base'


/**
 * For action parameter decoration.
 *
 * Will resolve the parameter's value with selected property from `request.extras`.
 *
 * @param {string} name A key whose value will be extracted from `request.extras`.
 *     If not specified, the whole object will be returned, equivalent to `request.extras`.
 */
export function extras(name?: string): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: Boolean(name) ? getExtras(name) : allExtras,
        })
    }
}


function getExtras(name: string) {
    return function(req: Request) {
        return req.extras[name]
    }
}

function allExtras(req: Request) {
    return req.extras
}
