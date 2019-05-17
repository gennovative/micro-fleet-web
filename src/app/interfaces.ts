import * as express from 'express'

export type Request<TModel = object> = express.Request & {
    /**
     * Contains custom objects.
     *
     * If any @micro-fleet filter wants to attach new property(-es) to
     * request object, it should attach here.
     */
    readonly extras: object & {
        /**
         * Object attached by @model decorator (ModelFilter)
         */
        readonly model?: TModel,

        /**
         * Object attached by @tenant decorator (TenantResolverFilter)
         */
        readonly tenantId?: bigint,
    },
}

export type Response = express.Response
