import { decorateParam } from './param-decor-base'


export const RES_INJECTED = Symbol('RES_INJECTED')

export type ResponseDecorator = () => Function

/**
 * For action parameter decoration.
 * Resolves the parameter's value with the current response object
 */
export function response(): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (req, res) => {
                res[RES_INJECTED] = true
                return res
            },
        })
        return proto
    }
}
