// Handle validation errors
// Handle server internal errors

import * as express from 'express'
import { injectable, ValidationError } from '@micro-fleet/common'

import { IActionErrorHandler } from '../decorators/filter'

/**
 * Provides method to look up tenant ID from tenant slug.
 */
@injectable()
export class ErrorHandlerFilter implements IActionErrorHandler {

    constructor(
        // @inject() private logProvider: ILogProvider
    ) {
        // Empty
    }

    public execute(error: Error, req: express.Request, res: express.Response, next: Function): void {
        if (res.headersSent || !(error instanceof ValidationError)) {
            // Delegate to Express default error handler
            return next(error)
        }
        // TODO: Write error to file or logging service.
        res.status(412).send(error['details'] || error)
    }
}
