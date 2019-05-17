import { injectable, inject, Maybe, Guard } from '@micro-fleet/common'
import { CacheProvider, CacheLevel, Types as CaT } from '@micro-fleet/cache'

import { IActionFilter } from '../decorators/filter'
import { Request, Response } from '../interfaces'
import { ActionFilterBase } from './ActionFilterBase'


/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class TenantResolverFilter
    extends ActionFilterBase
    implements IActionFilter {

    constructor(
            @inject(CaT.CACHE_PROVIDER) protected _cache: CacheProvider,
            // @inject(GvT.TENANT_PROVIDER) protected _tenantProvider: ITenantProvider
        ) {
        super()
        Guard.assertArgDefined('cache', _cache)
    }

    public async execute(req: Request, res: Response, next: Function): Promise<void> {
        const { tenantSlug } = req.params

        // Preserved slug, specially for system services.
        if (tenantSlug == '_') {
            req.params['tenantId'] = null
            return next()
        }

        const key = `common-web::tenant::${tenantSlug}`
        const tenantId = await this._cache.getPrimitive(key, false, false) as Maybe<BigInt>

        if (tenantId.hasValue) {
            console.log('TenantResolver: from cache')
            req.params['tenantId'] = tenantId
            return next()
        }

        // TODO: Else, look up from database
        // const tenant = await this._tenantProvider.findBySlug(tenantSlug)
        // if (!tenant) { return null }

        // Mocking
        const tenant = { id: Math.random().toString().slice(2) }
        this._cache.setPrimitive(key, tenant.id, null, CacheLevel.BOTH)

        this.addReadonlyProp(req.extras, 'tenantId', tenant.id)
        next()
    }
}
