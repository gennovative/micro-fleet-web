import * as express from 'express'


export interface RequestExtras {
    /**
     * Object attached by global filter `TenantResolverFilter`
     */
    readonly tenantId?: string,
}

export interface Request extends express.Request {
    /**
     * Contains custom objects.
     *
     * If any @micro-fleet filter wants to attach new property(-es) to
     * request object, it should attach here.
     */
    readonly extras: RequestExtras,
}

export interface Response extends express.Response {
}
