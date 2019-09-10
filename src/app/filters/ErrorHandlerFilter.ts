import { decorators as d } from '@micro-fleet/common'

import { IActionErrorHandler } from '../decorators/filter'
import { Request, Response } from '../interfaces'

/**
 * Catches unhandled exceptions from action methods.
 */
@d.injectable()
export class ErrorHandlerFilter implements IActionErrorHandler {

    public execute(error: Error, req: Request, res: Response, next: Function): void {
        const isDebugMode = Boolean(process.env['DEBUG'])
        //
        // TODO: Write error to file or logging service.
        //
        if (res.headersSent) {
            res.status(500).send(JSON.stringify(error, stringifyError))
            return
        }
        res.setHeader('Content-Type', 'application/json')
        if (error.name === 'ValidationError') {
            // https://httpstatuses.com/422 (UNPROCESSABLE ENTITY)
            res.status(422).send(JSON.stringify(error['details'] || error, stringifyError))
        }
        else if (isDebugMode) {
            res.status(500).send(JSON.stringify(error, stringifyError))
            console.log(error)
        }
        else {
            res.status(500).end()
        }
        next()
    }
}

function stringifyError(key: string, value: any) {
    if (! (value instanceof Error)) {
        return value
    }
    const error = {}

    Object.getOwnPropertyNames(value).forEach(function (prop) {
        error[prop] = value[prop]
    })

    return error
}
