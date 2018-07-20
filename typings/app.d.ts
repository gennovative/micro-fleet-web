/// <reference path="./global.d.ts" />
declare module '@micro-fleet/web/dist/app/constants/MetaData' {
	export class MetaData {
	    static readonly CONTROLLER: string;
	    static readonly CONTROLLER_FILTER: string;
	    static readonly ACTION: string;
	    static readonly ACTION_FILTER: string;
	    static readonly AUTHORIZED_FILTER: string;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/action' {
	export type ActionDecorator = (method: string, path?: string) => Function;
	export type ActionVerbDecorator = (path?: string) => Function;
	export type ActionDescriptor = {
	    [method: string]: string;
	};
	/**
	 * Used to decorate action function of REST controller class.
	 * @param {string} method Case-insensitive HTTP verb supported by Express
	     * 		(see full list at https://expressjs.com/en/4x/api.html#routing-methods)
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function action(method: string, path?: string): Function;
	/**
	 * Used to decorate an action that accepts request of ALL verbs.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function ALL(path?: string): Function;
	/**
	 * Used to decorate an action that accepts GET request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function GET(path?: string): Function;
	/**
	 * Used to decorate an action that accepts POST request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function POST(path?: string): Function;
	/**
	 * Used to decorate an action that accepts PUT request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function PUT(path?: string): Function;
	/**
	 * Used to decorate an action that accepts PATCH request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function PATCH(path?: string): Function;
	/**
	 * Used to decorate an action that accepts DELETE request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function DELETE(path?: string): Function;
	/**
	 * Used to decorate an action that accepts HEAD request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function HEAD(path?: string): Function;
	/**
	 * Used to decorate an action that accepts OPTIONS request.
	 * @param {string} path Segment of URL pointing to this action.
	 * 		If not specified, it is default to be the action's function name.
	 */
	export function OPTIONS(path?: string): Function;

}
declare module '@micro-fleet/web/dist/app/decorators/filter' {
	/**
	 * Provides operations to intercept HTTP requests to a controller.
	 */
	export interface IActionFilter {
	    execute(request: any, response: any, next: Function, ...params: any[]): void | Promise<void>;
	}
	/**
	 * Provides operations to handle errors thrown from controller actions.
	 */
	export interface IActionErrorHandler {
	    execute(error: any, request: any, response: any, next: Function): void;
	}
	export type ActionInterceptor = IActionFilter | IActionErrorHandler;
	/**
	 * Represents the order in which filters are invoked.
	 */
	export enum FilterPriority {
	    LOW = 0,
	    MEDIUM = 1,
	    HIGH = 2
	}
	export type FilterDecorator = <T extends ActionInterceptor>(FilterClass: Newable<T>, priority?: FilterPriority, ...filterParams: any[]) => Function;
	export type FilterArray<T extends ActionInterceptor = ActionInterceptor> = {
	    FilterClass: Newable<T>;
	    filterParams: any[];
	}[];
	export type PrioritizedFilterArray = FilterArray[];
	/**
	 * Used to add filter to controller class and controller action.
	 * @param {class} FilterClass Filter class whose name must end with "Filter".
	 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
	 */
	export function filter<T extends ActionInterceptor>(FilterClass: Newable<T>, priority?: FilterPriority, ...filterParams: any[]): Function;
	/**
	 * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
	 * depending on whether the filter is meant to apply on class or class method.
	 * @param FilterClass The filter class.
	 * @param TargetClassOrPrototype A class or class prototype.
	 * @param targetFunc Method name, if `TargetClass` is prototype object,
	 * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
	 */
	export function addFilterToTarget<T extends ActionInterceptor>(FilterClass: Newable<T>, TargetClassOrPrototype: Newable<T>, targetFunc?: string, priority?: FilterPriority, ...filterParams: any[]): Function;
	/**
	 * Prepares a filter then push it to given array.
	 */
	export function pushFilterToArray<T extends ActionInterceptor>(filters: PrioritizedFilterArray, FilterClass: Newable<T>, priority?: FilterPriority, ...filterParams: any[]): void;

}
declare module '@micro-fleet/web/dist/app/WebContext' {
	/**
	 * Serves as a global object for all web-related classes (controllers, policies...)
	 * to use.
	 */
	export class WebContext {
	    	    /**
	     * Gets url prefix. Eg: /api/v1.
	     */
	    readonly urlPrefix: string;
	    /**
	     * Sets prefix to all route url, eg: /api/v1. Must be set before add-ons initialization phase.
	     */
	    setUrlPrefix(prefix: string): void;
	}
	export const webContext: WebContext;

}
declare module '@micro-fleet/web/dist/app/ExpressServerAddOn' {
	/// <reference types="node" />
	import * as http from 'http';
	import * as express from 'express';
	import { Maybe } from '@micro-fleet/common';
	import { IActionErrorHandler, ActionInterceptor, PrioritizedFilterArray, FilterArray, FilterPriority } from '@micro-fleet/web/dist/app/decorators/filter'; type ControllerExports = {
	    [name: string]: Newable;
	};
	export enum ControllerCreationStrategy {
	    SINGLETON = 0,
	    TRANSIENT = 1
	}
	export class ExpressServerAddOn implements IServiceAddOn {
	    readonly name: string;
	    protected _server: http.Server;
	    protected _globalFilters: PrioritizedFilterArray;
	    protected _globalErrorHandlers: Newable[];
	    protected _isAlive: boolean;
	    	    	    	    	    	    	    	    /**
	     * Gets or sets strategy when creating controller instance.
	     */
	    controllerCreation: ControllerCreationStrategy;
	    /**
	     * Gets or sets path to controller classes.
	     */
	    controllerPath: string;
	    /**
	     * Gets express instance.
	     */
	    readonly express: express.Express;
	    /**
	     * Gets HTTP port number.
	     */
	    readonly port: number;
	    /**
	     * Gets URL prefix.
	     */
	    readonly urlPrefix: string;
	    constructor();
	    /**
	     * Registers a global-scoped filter which is called on every coming request.
	     * @param FilterClass The filter class.
	     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
	     */
	    addGlobalFilter<T extends ActionInterceptor>(FilterClass: Newable<T>, priority?: FilterPriority): void;
	    /**
	     * Registers a global-scoped error handler which catches error from filters and actions.
	     * @param HandlerClass The error handler class.
	     */
	    addGlobalErrorHandler<T extends IActionErrorHandler>(HandlerClass: Newable<T>): void;
	    /**
	     * @memberOf IServiceAddOn
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @memberOf IServiceAddOn
	     */
	    dispose(): Promise<void>;
	    /**
	     * @memberOf IServiceAddOn
	     */
	    init(): Promise<void>;
	    protected _createServer(): express.Express;
	    protected _startServer(app: express.Express): Promise<any>;
	    protected _loadControllers(): Promise<ControllerExports>;
	    protected _initControllers(controllers: ControllerExports, app: express.Express): void;
	    protected _buildControllerRoutes(CtrlClass: Newable, app: express.Express): express.Router;
	    protected _buildControllerFilters(CtrlClass: Function, router: express.Router): void;
	    protected _initActions(CtrlClass: Newable, router: express.Router): void;
	    protected _proxyActionFunc(actionFunc: Function, CtrlClass: Newable): Function;
	    protected _buildActionRoutesAndFilters(actionFunc: Function, actionName: string, CtrlClass: Newable, router: express.Router): void;
	    protected _getActionFilters(CtrlClass: Function, actionName: string): FilterArray;
	    protected _extractActionFromPrototype(prototype: any, name: string): Maybe<Function>;
	    	    	    protected _extractFilterExecuteFunc<T extends ActionInterceptor>(FilterClass: Newable<T>, filterParams: any[], paramLength?: number): Function;
	    protected _instantiateClass<T extends ActionInterceptor>(TargetClass: Newable<T>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): ActionInterceptor;
	    protected _instantiateClassFromContainer(TargetClass: Newable, isSingleton: boolean): any;
	    protected _instantiateClassTraditionally(TargetClass: Newable, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
	    protected _getMetadata(metaKey: string, classOrProto: any, propName?: string): any;
	    protected _assertValidController(ctrlName: string, CtrlClass: Newable): void;
	}
	export {};

}
declare module '@micro-fleet/web/dist/app/Types' {
	export class Types {
	    static readonly TENANT_RESOLVER: string;
	    static readonly WEBSERVER_ADDON: string;
	    static readonly AUTH_ADDON: string;
	}

}
declare module '@micro-fleet/web/dist/app/AuthAddOn' {
	import { IConfigurationProvider } from '@micro-fleet/common';
	import { ExpressServerAddOn } from '@micro-fleet/web/dist/app/ExpressServerAddOn';
	export type AuthResult = {
	    payload: any;
	    info: any;
	    status: any;
	};
	export class AuthAddOn implements IServiceAddOn {
	    	    	    readonly name: string;
	    constructor(_serverAddOn: ExpressServerAddOn, _configProvider: IConfigurationProvider);
	    /**
	     * @memberOf IServiceAddOn.init
	     */
	    init(): Promise<void>;
	    	    authenticate(request: any, response: any, next: Function): Promise<AuthResult>;
	    createToken(payload: any, isRefresh: Boolean): Promise<string>;
	    /**
	     * @memberOf IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @memberOf IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	}

}
declare module '@micro-fleet/web/dist/app/RestControllerBase' {
	import * as express from 'express';
	export type TrailsRouteConfigItem = {
	    method: string | string[];
	    path: string;
	    handler: string | Function;
	    config?: any;
	};
	export abstract class RestControllerBase {
	    constructor();
	    /**
	     * Responds as Accepted with status code 202 and optional data.
	     * @param res Express response object.
	     * @param data Data to optionally return to client.
	     */
	    protected accepted(res: express.Response, data?: any): void;
	    /**
	     * Responds as Created with status code 201 and optional data.
	     * @param res Express response object.
	     * @param data Data to optionally return to client.
	     */
	    protected created(res: express.Response, data?: any): void;
	    /**
	     * Responds as OK with status code 200 and optional data.
	     * @param res Express response object.
	     * @param data Data to optionally return to client.
	     */
	    protected ok(res: express.Response, data?: any): void;
	    /**
	     * Responds with error status code (default 400) and writes error to server log,
	     * then returned it to client.
	     * @param res Express response object.
	     * @param returnErr Error to dump to server log, and returned to client.
	     * @param statusCode HTTP status code. Must be 4xx. Default is 400.
	     * @param shouldLogErr Whether to write error to server log (eg: Illegal attempt to read/write resource...). Default to false.
	     */
	    protected clientError(res: express.Response, returnErr: any, statusCode?: number, shouldLogErr?: boolean): void;
	    /**
	     * Responds as Forbidden with status code 403 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected forbidden(res: express.Response, returnErr?: any): void;
	    /**
	     * Responds as Not Found with status code 404 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected notFound(res: express.Response, returnErr?: any): void;
	    /**
	     * Responds as Unauthorized with status code 401 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected unauthorized(res: express.Response, returnErr?: any): void;
	    /**
	     * Responds error Precondition Failed with status code 412 and
	     * then returned error to client.
	     * @param res Express response object.
	     * @param returnErr Error to returned to client.
	     */
	    protected validationError(res: express.Response, returnErr: any): void;
	    /**
	     * Responds as Internal Error with status code 500 and
	     * writes error to server log. The error is not returned to client.
	     * @param res Express response object.
	     * @param logErr Error to dump to server log, but not returned to client.
	     */
	    protected internalError(res: express.Response, logErr: any): void;
	    /**
	     * Sends response to client.
	     * @param res Express response object.
	     * @param data Data to return to client.
	     * @param statusCode HTTP status code. Default is 200.
	     */
	    protected send(res: express.Response, data: any, statusCode: number): express.Response;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/controller' {
	export type ControllerDecorator = (path?: string) => Function;
	/**
	 * Used to decorate REST controller class.
	 * @param {string} path Segment of URL pointing to this controller.
	 * 		If '_' is given, it is extract from controller class name: {path}Controller.
	 * 		If not specified, it is default to be empty string.
	 */
	export function controller(path?: string): Function;

}
declare module '@micro-fleet/web/dist/app/filters/ActionFilterBase' {
	export abstract class ActionFilterBase {
	    protected addReadonlyProp(obj: object, prop: string, value: any): void;
	}

}
declare module '@micro-fleet/web/dist/app/filters/AuthorizeFilter' {
	import * as express from 'express';
	import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
	import { ActionFilterBase } from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
	export class AuthorizeFilter extends ActionFilterBase implements IActionFilter {
	    	    execute(request: express.Request, response: express.Response, next: Function): Promise<any>;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/authorized' {
	export type AuthorizedDecorator = () => Function;
	/**
	 * Marks a controller or action to require auth token to be accessible.
	 */
	export function authorized(): Function;

}
declare module '@micro-fleet/web/dist/app/filters/ModelFilter' {
	import * as express from 'express';
	import * as joi from 'joi';
	import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
	import { ActionFilterBase } from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
	export type ModelFilterOptions = {
	    /**
	     * Result object will be instance of this class.
	     */
	    ModelClass?: Newable;
	    /**
	     * Whether this request contains all properties of model class,
	     * or just some of them.
	     * Default: false
	     */
	    isPartial?: boolean;
	    /**
	     * Function to extract model object from request body.
	     * As default, model object is extracted from `request.body.model`.
	     */
	    modelPropFn?: (request: express.Request) => any;
	    /**
	     * Custom validation rule for arbitrary object.
	     */
	    customValidationRule?: joi.SchemaMap;
	};
	export class ModelFilter extends ActionFilterBase implements IActionFilter {
	    execute(request: express.Request, response: express.Response, next: Function, options: ModelFilterOptions): void;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/model' {
	import { ModelFilterOptions } from '@micro-fleet/web/dist/app/filters/ModelFilter';
	export type ModelDecorator = (opts: ModelFilterOptions) => Function;
	/**
	 * Marks a controller or action to require auth token to be accessible.
	 */
	export function model(opts: ModelFilterOptions): Function;

}
declare module '@micro-fleet/web/dist/app/decorators/index' {
	import { ControllerDecorator } from '@micro-fleet/web/dist/app/decorators/controller';
	import { AuthorizedDecorator } from '@micro-fleet/web/dist/app/decorators/authorized';
	import { ModelDecorator } from '@micro-fleet/web/dist/app/decorators/model';
	import { FilterDecorator } from '@micro-fleet/web/dist/app/decorators/filter';
	import * as act from '@micro-fleet/web/dist/app/decorators/action';
	export type Decorators = {
	    /**
	     * Used to decorate an action that accepts request of ALL verbs.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    ALL: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts DELETE request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    DELETE: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts GET request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    GET: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts POST request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    POST: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts PATCH request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    PATCH: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts PUT request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    PUT: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts HEAD request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    HEAD: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts OPTIONS request.
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    OPTIONS: act.ActionVerbDecorator;
	    /**
	     * Used to decorate action function of REST controller class.
	     * @param {string} method Case-insensitive HTTP verb supported by Express
	     * 		(see full list at https://expressjs.com/en/4x/api.html#routing-methods)
	     * @param {string} path Segment of URL pointing to this action.
	     * 		If not specified, it is default to be the action's function name.
	     */
	    action: act.ActionDecorator;
	    /**
	     * Used to decorate REST controller class.
	     * @param {string} path Segment of URL pointing to this controller,
	     * 		if not specified, it is extract from controller class name: {path}Controller.
	     */
	    controller: ControllerDecorator;
	    /**
	     * Marks a controller or action to require auth token to be accessible.
	     */
	    authorized: AuthorizedDecorator;
	    /**
	     * Used to add filter to controller class and controller action.
	     * @param {class} FilterClass Filter class.
	     * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
	     * 		This array function won't be executed, but is used to extract filter function name.
	     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	     */
	    filter: FilterDecorator;
	    model: ModelDecorator;
	};
	export const decorators: Decorators;

}
declare module '@micro-fleet/web/dist/app/constants/AuthConstant' {
	 enum TokenType {
	    ACCESS = "jwt-access",
	    REFRESH = "jwt-refresh"
	}
	export { TokenType };

}
declare module '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter' {
	import * as express from 'express';
	import { IActionErrorHandler } from '@micro-fleet/web/dist/app/decorators/filter';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class ErrorHandlerFilter implements IActionErrorHandler {
	    constructor();
	    execute(error: Error, req: express.Request, res: express.Response, next: Function): void;
	}

}
declare module '@micro-fleet/web/dist/app/filters/TenantResolverFilter' {
	import * as express from 'express';
	import { CacheProvider } from '@micro-fleet/cache';
	import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class TenantResolverFilter implements IActionFilter {
	    protected _cache: CacheProvider;
	    constructor(_cache: CacheProvider);
	    execute(req: express.Request, res: express.Response, next: Function): Promise<void>;
	}

}
declare module '@micro-fleet/web/dist/app/register-addon' {
	import { ExpressServerAddOn } from '@micro-fleet/web/dist/app/ExpressServerAddOn';
	export function registerWebAddOn(): ExpressServerAddOn;

}
declare module '@micro-fleet/web' {
	import decoratorObj = require('@micro-fleet/web/dist/app/decorators/index');
	export const decorators: decoratorObj.Decorators;
	export * from '@micro-fleet/web/dist/app/constants/AuthConstant';
	export * from '@micro-fleet/web/dist/app/constants/MetaData';
	export { IActionFilter, IActionErrorHandler, FilterPriority } from '@micro-fleet/web/dist/app/decorators/filter';
	export * from '@micro-fleet/web/dist/app/filters/AuthorizeFilter';
	export * from '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter';
	export * from '@micro-fleet/web/dist/app/filters/ModelFilter';
	export * from '@micro-fleet/web/dist/app/filters/TenantResolverFilter';
	export * from '@micro-fleet/web/dist/app/AuthAddOn';
	export * from '@micro-fleet/web/dist/app/ExpressServerAddOn';
	export * from '@micro-fleet/web/dist/app/RestControllerBase';
	export * from '@micro-fleet/web/dist/app/register-addon';
	export * from '@micro-fleet/web/dist/app/Types';
	export * from '@micro-fleet/web/dist/app/WebContext';

}
