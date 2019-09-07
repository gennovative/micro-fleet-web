import { decorateParam } from './param-decor-base'


export const RES_INJECTED = Symbol('RES_INJECTED')

/**
 * For action parameter decoration.
 * Resolves the parameter's value with the current response object
 */
export function response(): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (req, res) => {
                res[RES_INJECTED] = true
                return res
            },
        })
    }
}
