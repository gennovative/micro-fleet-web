/* istanbul ignore next */
if (!Reflect || typeof Reflect['hasOwnMetadata'] !== 'function') {
    require('reflect-metadata')
}

import * as act from './action'
import { controller, ControllerDecorator } from './controller'
import { model, ModelDecorator } from './model'
import { filter, FilterDecorator } from './filter'
import { header, HeaderDecorator } from './header'
import { request, RequestDecorator } from './request'
import { response, ResponseDecorator } from './response'
import { tenantId, TenantIdDecorator } from './tenantId'
import { param, ParamDecorator } from './param'
import { query, QueryDecorator } from './query'


export type Decorators = {

    /**
     * Used to decorate an action that accepts request of ALL verbs.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    ALL: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts DELETE request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    DELETE: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts GET request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    GET: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts POST request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    POST: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts PATCH request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    PATCH: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts PUT request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    PUT: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts HEAD request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    HEAD: act.ActionVerbDecorator,

    /**
     * Used to decorate an action that accepts OPTIONS request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    OPTIONS: act.ActionVerbDecorator,

    /**
     * Used to decorate action function of REST controller class.
     * @param {string} method Case-insensitive HTTP verb supported by Express
     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    action: act.ActionDecorator,

    /**
     * Used to decorate REST controller class.
     * @param {string} path Segment of URL pointing to this controller,
     *         if not specified, it is extract from controller class name: {path}Controller.
     */
    controller: ControllerDecorator,

    /**
     * Used to add filter to controller class and controller action.
     * @param {class} FilterClass Filter class.
     * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
     *         This array function won't be executed, but is used to extract filter function name.
     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
     */
    filter: FilterDecorator,

    header: HeaderDecorator,

    /**
     * For action parameter decoration.
     * Attempts to translate request body to desired model class,
     * then attaches to the parameter's value.
     */
    model: ModelDecorator,

    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current request object
     */
    request: RequestDecorator,

    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current response object
     */
    response: ResponseDecorator,

    /**
     * For action parameter decoration.
     * Will resolve the parameter's value with a route params from `request.params`.
     */
    param: ParamDecorator,

    /**
     * For action parameter decoration.
     * Will resolve the parameter's value with query string value from `request.params`.
     */
    query: QueryDecorator,

    /**
     * For action parameter decoration.
     * Resolves the parameter's value with tenantId from request params.
     */
    tenantId: TenantIdDecorator,
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
    header,
    model,
    request,
    response,
    param,
    query,
    tenantId,
}
