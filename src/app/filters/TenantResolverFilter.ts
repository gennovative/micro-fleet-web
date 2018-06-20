import * as express from 'express';

import { injectable, inject, Maybe, Guard } from '@micro-fleet/common';
import { CacheProvider, CacheLevel, Types as CaT } from '@micro-fleet/cache';

import { IActionFilter } from '../decorators/filter';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class TenantResolverFilter implements IActionFilter {

	constructor(
			@inject(CaT.CACHE_PROVIDER) protected _cache: CacheProvider,
			//@inject(GvT.TENANT_PROVIDER) protected _tenantProvider: ITenantProvider
		) {
		Guard.assertArgDefined('cache', _cache);
	}

	public async execute(req: express.Request, res: express.Response, next: Function): Promise<void> {
		const { tenantSlug } = req.params;

		// Preserved slug, specially for system services.
		if (tenantSlug == '_') { 
			req.params['tenantId'] = null;
			return next();
		}

		const key = `common-web::tenant::${tenantSlug}`;
		const tenantId = await this._cache.getPrimitive(key, false, false) as Maybe<BigInt>;

		if (tenantId.hasValue) {
			console.log('TenantResolver: from cache');
			req.params['tenantId'] = tenantId;
			return next();
		}

		// TODO: Else, look up from database
		// let tenant = await this._tenantProvider.findBySlug(tenantSlug);
		// if (!tenant) { return null; }

		// Mocking
		const tenant = { id: Math.random().toString().slice(2) };
		this._cache.setPrimitive(key, tenant.id, null, CacheLevel.BOTH);

		console.log('TenantResolver: from repo');
		req.params['tenantId'] = tenant.id;
		next();
	}
}