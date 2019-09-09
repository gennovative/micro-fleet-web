"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const ActionFilterBase_1 = require("./ActionFilterBase");
/**
 * Provides method to look up tenant ID from tenant slug.
 */
let TenantResolverFilter = class TenantResolverFilter extends ActionFilterBase_1.ActionFilterBase {
    constructor() {
        super();
    }
    async execute(req, res, next) {
        const { tenantSlug } = req.params;
        // Preserved slug, specially for system services.
        if (tenantSlug == '_') {
            req.params['tenantId'] = null;
            return next();
        }
        // const key = `common-web::tenant::${tenantSlug}`
        const tenantId = common_1.Maybe.Just('0'); // await this._cache.getPrimitive(key) as Maybe<string>
        if (tenantId.isJust) {
            console.log('TenantResolver: from cache');
            req['extras']['tena' + 'ntId'] = tenantId.value;
            return next();
        }
        // TODO: Else, look up from database
        // const tenant = await this._tenantProvider.findBySlug(tenantSlug)
        // if (!tenant) { return null }
        // Mocking
        const tenant = { id: Math.random().toString().slice(2) };
        // this._cache.setPrimitive(key, tenant.id, { level: CacheLevel.BOTH })
        this.addReadonlyProp(req.extras, 'tenantId', tenant.id);
        next();
    }
};
TenantResolverFilter = __decorate([
    common_1.decorators.injectable(),
    __metadata("design:paramtypes", [])
], TenantResolverFilter);
exports.TenantResolverFilter = TenantResolverFilter;
//# sourceMappingURL=TenantResolverFilter.js.map