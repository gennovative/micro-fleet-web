import { CacheProvider, CacheLevel, Types as CaT } from 'back-lib-cache-provider';
import { injectable, inject, unmanaged, Guard, HandlerContainer } from 'back-lib-common-util';

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class TenantResolver {

	constructor(
			@inject(CaT.CACHE_PROVIDER) protected _cache: CacheProvider,
			//@inject(GvT.TENANT_PROVIDER) protected _tenantProvider: ITenantProvider
		) {
	}

	/**
	 * Looks up tenant ID from given slug.
	 * @param tenantSlug 
	 */
	public async resolve(tenantSlug: string): Promise<BigSInt> {
		// Preserved slug, specially for system services
		if (tenantSlug == '_') { return null; }

		let key = `tenant::${tenantSlug}`,
			tenantId: BigSInt = await this._cache.getPrimitive(key, false, false);
		if (tenantId) { return tenantId; }

		// let tenant = await this._tenantProvider.findBySlug(tenantSlug);
		// if (!tenant) { return null; }

		// Mocking
		let tenant = { id: Math.random() + '' };

		this._cache.setPrimitive(key, tenant.id, null, CacheLevel.BOTH);
		return tenant.id;
	}
}