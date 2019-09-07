/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata')
}
import * as act from './action'
import { controller } from './controller'
import * as m from './model'
import { extras } from './extras'
import { filter } from './filter'
import { header } from './header'
import { request } from './request'
import { response } from './response'
import { param } from './param'
import { query } from './query'


export * from './param-decor-base'

export type ModelDecoratorOptions = m.ModelDecoratorOptions

export type Decorators = {

    /**
     * Used to decorate an action that accepts request of ALL verbs.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    ALL: typeof act.ALL,

    /**
     * Used to decorate an action that accepts DELETE request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    DELETE: typeof act.DELETE,

    /**
     * Used to decorate an action that accepts GET request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    GET: typeof act.GET,

    /**
     * Used to decorate an action that accepts POST request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    POST: typeof act.POST,

    /**
     * Used to decorate an action that accepts PATCH request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    PATCH: typeof act.PATCH,

    /**
     * Used to decorate an action that accepts PUT request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    PUT: typeof act.PUT,

    /**
     * Used to decorate an action that accepts HEAD request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    HEAD: typeof act.HEAD,

    /**
     * Used to decorate an action that accepts OPTIONS request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    OPTIONS: typeof act.OPTIONS,

    /**
     * Used to decorate action function of REST controller class.
     * @param {string} method Case-insensitive HTTP verb supported by Express
     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    action: typeof act.action,

    /**
     * Used to decorate REST controller class.
     * @param {string} path Segment of URL pointing to this controller,
     *         if not specified, it is extract from controller class name: {path}Controller.
     */
    controller: typeof controller,

    /**
     * Used to add filter to controller class and controller action.
     * @param {class} FilterClass Filter class.
     * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
     *         This array function won't be executed, but is used to extract filter function name.
     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
     */
    filter: typeof filter,

    /**
     * For action parameter decoration.
     *
     * Will resolve the parameter's value with selected property from `request.extras`.
     *
     * @param {string} name A key whose value will be extracted from `request.extras`.
     *     If not specified, the whole object will be returned, equivalent to `request.extras`.
     */
    extras: typeof extras,

    header: typeof header,

    /**
     * For action parameter decoration.
     * Attempts to translate request body to desired model class,
     * then attaches to the parameter's value.
     */
    model: typeof m.model,

    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current request object
     */
    request: typeof request,

    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current response object
     */
    response: typeof response,

    /**
     * For action parameter decoration.
     *
     * Will resolve the parameter's value with a route params from `request.params`.
     *
     * @param {string} name A key whose value will be extracted from route params.
     *     If not specified, the deserialized params object will be returned, equivalent to `request.params`.
     * @param {Function} parseFn Function to parse extracted value to expected data type.
     *     This parameter is ignored if `name` is not specified.
     */
    param: typeof param,

    /**
     * For action parameter decoration.
     *
     * Will resolve the parameter's value with query string value from `request.query`.
     *
     * @param {string} name A key whose value will be extracted from query string.
     *     If not specified, the deserialized query object will be returned, equivalent to `request.query`.
     * @param {Function} parseFn Function to parse extracted value to expected data type.
     *     This parameter is ignored if `name` is not specified.
     */
    query: typeof query,
}

export const decorators: Decorators = {
    ALL: act.ALL,
    DELETE: act.DELETE,
    GET: act.GET,
    POST: act.POST,
    PATCH: act.PATCH,
    PUT: act.PUT,
    HEAD: act.HEAD,
    OPTIONS: act.OPTIONS,
    action: act.action,
    controller,
    filter,
    extras,
    header,
    model: m.model,
    request,
    response,
    param,
    query,
}
