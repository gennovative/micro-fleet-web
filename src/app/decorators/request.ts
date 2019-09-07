import { decorateParam } from './param-decor-base'


/**
 * For action parameter decoration.
 * Resolves the parameter's value with the current request object
 */
export function request(): ParameterDecorator {
    return function (proto: any, method: string | symbol, paramIndex: number): void {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: (req) => req,
        })
    }
}
