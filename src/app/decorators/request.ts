import { decorateParam } from './param-decor-base'


export type RequestDecorator = () => Function

/**
 * For action parameter decoration.
 * Resolves the parameter's value with the current request object
 */
export function request(): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (req) => req,
        })
        return proto
    }
}
