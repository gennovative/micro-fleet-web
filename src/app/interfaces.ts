import * as express from 'express'

export type Request<TModel = object> = express.Request & {
    readonly model: TModel,
}

export type Response = express.Response
