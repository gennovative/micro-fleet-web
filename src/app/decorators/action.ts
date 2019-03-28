/// <reference types="reflect-metadata" />

import { MetaData } from '../constants/MetaData'


export type ActionDecorator = (method: string, path?: string) => Function
export type ActionVerbDecorator = (path?: string) => Function

export type ActionDescriptor = {
    [method: string]: string
}

/**
 * Used to decorate action function of REST controller class.
 * @param {string} method Case-insensitive HTTP verb supported by Express
     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function action(method: string, path?: string): Function {
    return function (proto: any, funcName: string): Function {
        if (!path) {
            path = `/${funcName}`
        } else if (path.length > 1) {
            if (!path.startsWith('/')) {
                // Add heading slash
                path = '/' + path
            }
            if (path.endsWith('/')) {
                // Remove trailing slash
                path = path.substr(0, path.length - 1)
            }
        }

        let actionDesc: ActionDescriptor
        if (Reflect.hasOwnMetadata(MetaData.ACTION, proto.constructor, funcName)) {
            actionDesc = Reflect.getOwnMetadata(MetaData.ACTION, proto.constructor, funcName)
            actionDesc[method.toLowerCase()] = path
        } else {
            actionDesc = {
                [method.toLowerCase()]: path,
            }
        }
        Reflect.defineMetadata(MetaData.ACTION, actionDesc, proto.constructor, funcName)
        return proto
    }
}

/**
 * Used to decorate an action that accepts request of ALL verbs.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function ALL(path?: string): Function {
    return action('all', path)
}

/**
 * Used to decorate an action that accepts GET request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function GET(path?: string): Function {
    return action('get', path)
}

/**
 * Used to decorate an action that accepts POST request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function POST(path?: string): Function {
    return action('post', path)
}

/**
 * Used to decorate an action that accepts PUT request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function PUT(path?: string): Function {
    return action('put', path)
}

/**
 * Used to decorate an action that accepts PATCH request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function PATCH(path?: string): Function {
    return action('patch', path)
}

/**
 * Used to decorate an action that accepts DELETE request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function DELETE(path?: string): Function {
    return action('delete', path)
}

/**
 * Used to decorate an action that accepts HEAD request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function HEAD(path?: string): Function {
    return action('head', path)
}

/**
 * Used to decorate an action that accepts OPTIONS request.
 * @param {string} path Segment of URL pointing to this action.
 *         If not specified, it is default to be the action's function name.
 */
export function OPTIONS(path?: string): Function {
    return action('options', path)
}
