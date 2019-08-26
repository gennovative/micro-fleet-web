import { serviceContext, Maybe } from '@micro-fleet/common'

import { Request } from '../interfaces'
import { decorateParam } from './param-decor-base'


export type TenantIdDecorator = () => Function


/**
 * Attempts to get tenant ID from tenant slug in request params.
 */
export async function extractTenantId(req: Request): Promise<Maybe<string>> {
    if (req.extras.tenantId) {
        // If TenantResolverFilter is register as global filter
        return Maybe.Just(req.extras.tenantId)
    }
    const container = serviceContext.dependencyContainer
    const tenantSvc: any = container.resolve('')
    const maybeId = await tenantSvc.getIdBySlug(req.params['tenant'])

    return maybeId
}

/*
 * For action parameter decoration.
 * Will resolve the parameter's value with tenantId from request params.
 */
export function tenantId(): Function {
    return function (proto: any, method: string, paramIndex: number): Function {
        decorateParam({
            TargetClass: proto.constructor,
            method,
            paramIndex,
            resolverFn: extractTenantId,
        })
        return proto
    }
}
