/// <reference path="./global.d.ts" />
declare module '@micro-fleet/web/dist/app/constants/MetaData' {
	export class MetaData {
	    static readonly CONTROLLER = "micro-fleet-web:controller";
	    static readonly CONTROLLER_FILTER = "micro-fleet-web:controllerFilter";
	    static readonly ACTION = "micro-fleet-web:action";
	    static readonly ACTION_FILTER = "micro-fleet-web:actionFilter";
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
	     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function action(method: string, path?: string): Function;
	/**
	 * Used to decorate an action that accepts request of ALL verbs.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function ALL(path?: string): Function;
	/**
	 * Used to decorate an action that accepts GET request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function GET(path?: string): Function;
	/**
	 * Used to decorate an action that accepts POST request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function POST(path?: string): Function;
	/**
	 * Used to decorate an action that accepts PUT request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function PUT(path?: string): Function;
	/**
	 * Used to decorate an action that accepts PATCH request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function PATCH(path?: string): Function;
	/**
	 * Used to decorate an action that accepts DELETE request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function DELETE(path?: string): Function;
	/**
	 * Used to decorate an action that accepts HEAD request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
	 */
	export function HEAD(path?: string): Function;
	/**
	 * Used to decorate an action that accepts OPTIONS request.
	 * @param {string} path Segment of URL pointing to this action.
	 *         If not specified, it is default to be the action's function name.
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
declare module '@micro-fleet/web/dist/app/interfaces' {
	import * as express from 'express';
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
	        readonly model?: TModel;
	        /**
	         * Object attached by @tenant decorator (TenantResolverFilter)
	         */
	        readonly tenantId?: bigint;
	    };
	};
	export type Response = express.Response;

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
	import { IDependencyContainer, Maybe, IConfigurationProvider } from '@micro-fleet/common';
	import { IActionErrorHandler, ActionInterceptor, PrioritizedFilterArray, FilterArray, FilterPriority } from '@micro-fleet/web/dist/app/decorators/filter'; type ControllerExports = {
	    [name: string]: Newable;
	};
	export enum ControllerCreationStrategy {
	    SINGLETON = 0,
	    TRANSIENT = 1
	}
	export class ExpressServerAddOn implements IServiceAddOn {
	    protected _configProvider: IConfigurationProvider;
	    protected _depContainer: IDependencyContainer;
	    /**
	     * Gets this add-on's name.
	     */
	    readonly name: string;
	    /**
	     * Gets or sets strategy when creating controller instance.
	     */
	    controllerCreation: ControllerCreationStrategy;
	    /**
	     * Gets or sets path to folder containing controller classes.
	     */
	    controllerPath: string;
	    protected _globalFilters: PrioritizedFilterArray;
	    protected _globalErrorHandlers: Newable[];
	    /**
	     * The readiness to accept incoming requests.
	     * This property should be set to `false` in "deadLetter" event so that
	     * the server can finalized existing requests, but does not accept new ones.
	     */
	    protected _isAlive: boolean;
	    /**
	     * Whether to start HTTPS server
	     */
	    protected _sslEnabled: boolean;
	    /**
	     * Port listened by HTTPS server.
	     * Default as 443.
	     */
	    protected _sslPort: number;
	    /**
	     * Path to SSL key file
	     */
	    protected _sslKeyFile: string;
	    /**
	     * Path to SSL certificate file
	     */
	    protected _sslCertFile: string;
	    /**
	     * Whether to start only HTTPS server, and not starting HTTP server
	     */
	    protected _sslOnly: boolean;
	    /**
	     * Instance of HTTPS server
	     */
	    protected _sslServer: http.Server;
	    /**
	     * Instance of HTTP server
	     */
	    protected _server: http.Server;
	    /**
	     * Port listened by HTTPS server.
	     * Default as 80.
	     */
	    protected _port: number;
	    /**
	     * Prefix for all routes.
	     * Default as /api/v1.
	     */
	    protected _urlPrefix: string;
	    /**
	     * Instance of Express
	     */
	    protected _express: express.Express;
	    /**
	     * Gets express instance.
	     */
	    readonly express: express.Express;
	    /**
	     * Gets HTTP port number.
	     */
	    readonly port: number;
	    /**
	     * Gets HTTPS port number.
	     */
	    readonly portSSL: number;
	    /**
	     * Gets URL prefix.
	     */
	    readonly urlPrefix: string;
	    constructor(_configProvider: IConfigurationProvider, _depContainer: IDependencyContainer);
	    /**
	     * Registers a global-scoped filter which is called on every coming request.
	     * @param FilterClass The filter class.
	     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
	     */
	    addGlobalFilter<TFilter extends ActionInterceptor>(FilterClass: Newable<TFilter>, priority?: FilterPriority): void;
	    /**
	     * Registers a global-scoped error handler which catches error from filters and actions.
	     * @param HandlerClass The error handler class.
	     */
	    addGlobalErrorHandler<THandler extends IActionErrorHandler>(HandlerClass: Newable<THandler>): void;
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
	    protected loadConfig(): void;
	    protected getCfg<TVal extends PrimitiveType>(name: string, defaultValue: any): TVal;
	    protected _setupExpress(): express.Express;
	    protected _startServers(app: express.Express): Promise<any>;
	    protected _startHttp(app: express.Express): Promise<any>;
	    protected _startSsl(app: express.Express): Promise<any>;
	    protected _readKeyPairs(): [string, string];
	    protected _loadControllers(): Promise<ControllerExports>;
	    protected _initControllers(controllers: ControllerExports, app: express.Express): void;
	    protected _buildControllerRoutes(CtrlClass: Newable, app: express.Express): express.Router;
	    protected _buildControllerFilters(CtrlClass: Function, router: express.Router): void;
	    protected _initActions(CtrlClass: Newable, router: express.Router): void;
	    protected _proxyActionFunc(actionFunc: Function, CtrlClass: Newable): Function;
	    protected _buildActionRoutesAndFilters(actionFunc: Function, actionName: string, CtrlClass: Newable, router: express.Router): void;
	    protected _getActionFilters(CtrlClass: Function, actionName: string): FilterArray;
	    protected _extractActionFromPrototype(prototype: any, name: string): Maybe<Function>;
	    protected _useFilterMiddleware(filters: PrioritizedFilterArray, appOrRouter: express.Express | express.Router, routePath?: string): void;
	    protected _useErrorHandlerMiddleware(handlers: Newable[], appOrRouter: express.Express | express.Router): void;
	    protected _extractFilterExecuteFunc<TFilter extends ActionInterceptor>(FilterClass: Newable<TFilter>, filterParams: any[], paramLength?: number): Function;
	    protected _instantiateClass<TTarget extends ActionInterceptor>(TargetClass: Newable<TTarget>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): ActionInterceptor;
	    protected _instantiateClassFromContainer(TargetClass: Newable, isSingleton: boolean): any;
	    protected _instantiateClassTraditionally(TargetClass: Newable, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
	    protected _getMetadata(metaKey: string, classOrProto: any, propName?: string): any;
	    protected _assertValidController(ctrlName: string, CtrlClass: Newable): void;
	}
	export {};

}
declare module '@micro-fleet/web/dist/app/RestControllerBase' {
	import { Response } from '@micro-fleet/web/dist/app/interfaces';
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
	    protected accepted(res: Response, data?: any): void;
	    /**
	     * Responds as Created with status code 201 and optional data.
	     * @param res Express response object.
	     * @param data Data to optionally return to client.
	     */
	    protected created(res: Response, data?: any): void;
	    /**
	     * Responds as OK with status code 200 and optional data.
	     * @param res Express response object.
	     * @param data Data to optionally return to client.
	     */
	    protected ok(res: Response, data?: any): void;
	    /**
	     * Responds with error status code (default 400) and writes error to server log,
	     * then returned it to client.
	     * @param res Express response object.
	     * @param returnErr Error to dump to server log, and returned to client.
	     * @param statusCode HTTP status code. Must be 4xx. Default is 400.
	     * @param shouldLogErr Whether to write error to server log (eg: Illegal attempt to read/write resource...). Default to false.
	     */
	    protected clientError(res: Response, returnErr: any, statusCode?: number, shouldLogErr?: boolean): void;
	    /**
	     * Responds as Forbidden with status code 403 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected forbidden(res: Response, returnErr?: any): void;
	    /**
	     * Responds as Not Found with status code 404 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected notFound(res: Response, returnErr?: any): void;
	    /**
	     * Responds as Unauthorized with status code 401 and optional error message.
	     * @param res Express response object.
	     * @param returnErr Data to optionally return to client.
	     */
	    protected unauthorized(res: Response, returnErr?: any): void;
	    /**
	     * Responds error Precondition Failed with status code 412 and
	     * then returned error to client.
	     * @param res Express response object.
	     * @param returnErr Error to returned to client.
	     */
	    protected validationError(res: Response, returnErr: any): void;
	    /**
	     * Responds as Internal Error with status code 500 and
	     * writes error to server log. The error is not returned to client.
	     * @param res Express response object.
	     * @param logErr Error to dump to server log, but not returned to client.
	     */
	    protected internalError(res: Response, logErr: any): void;
	    /**
	     * Sends response to client.
	     * @param res Express response object.
	     * @param data Data to return to client.
	     * @param statusCode HTTP status code. Default is 200.
	     */
	    protected send(res: Response, data: any, statusCode: number): Response;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/controller' {
	export type ControllerDecorator = (path?: string) => Function;
	/**
	 * Used to decorate REST controller class.
	 * @param {string} path Segment of URL pointing to this controller.
	 *         If '_' is given, it is extract from controller class name: {path}Controller.
	 *         If not specified, it is default to be empty string.
	 */
	export function controller(path?: string): Function;

}
declare module '@micro-fleet/web/dist/app/filters/ActionFilterBase' {
	export abstract class ActionFilterBase {
	    protected addReadonlyProp(obj: object, prop: string, value: any): void;
	}

}
declare module '@micro-fleet/web/dist/app/filters/ModelFilter' {
	import * as joi from 'joi';
	import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
	import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
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
	    modelPropFn?: <T extends object = object>(request: Request<T>) => any;
	    /**
	     * Custom validation rule for arbitrary object.
	     */
	    customValidationRule?: joi.SchemaMap;
	};
	export class ModelFilter extends ActionFilterBase implements IActionFilter {
	    execute(request: Request, response: Response, next: Function, options: ModelFilterOptions): void;
	}

}
declare module '@micro-fleet/web/dist/app/decorators/model' {
	import { ModelFilterOptions } from '@micro-fleet/web/dist/app/filters/ModelFilter';
	export type ModelDecorator = (opts: ModelFilterOptions) => Function;
	/**
	 * Attempts to translate request body to desired model class.
	 */
	export function model(opts: ModelFilterOptions): Function;

}
declare module '@micro-fleet/web/dist/app/decorators/index' {
	import { ControllerDecorator } from '@micro-fleet/web/dist/app/decorators/controller';
	import { ModelDecorator } from '@micro-fleet/web/dist/app/decorators/model';
	import { FilterDecorator } from '@micro-fleet/web/dist/app/decorators/filter';
	import * as act from '@micro-fleet/web/dist/app/decorators/action';
	export type Decorators = {
	    /**
	     * Used to decorate an action that accepts request of ALL verbs.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    ALL: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts DELETE request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    DELETE: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts GET request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    GET: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts POST request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    POST: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts PATCH request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    PATCH: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts PUT request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    PUT: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts HEAD request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    HEAD: act.ActionVerbDecorator;
	    /**
	     * Used to decorate an action that accepts OPTIONS request.
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    OPTIONS: act.ActionVerbDecorator;
	    /**
	     * Used to decorate action function of REST controller class.
	     * @param {string} method Case-insensitive HTTP verb supported by Express
	     *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
	     * @param {string} path Segment of URL pointing to this action.
	     *         If not specified, it is default to be the action's function name.
	     */
	    action: act.ActionDecorator;
	    /**
	     * Used to decorate REST controller class.
	     * @param {string} path Segment of URL pointing to this controller,
	     *         if not specified, it is extract from controller class name: {path}Controller.
	     */
	    controller: ControllerDecorator;
	    /**
	     * Used to add filter to controller class and controller action.
	     * @param {class} FilterClass Filter class.
	     * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
	     *         This array function won't be executed, but is used to extract filter function name.
	     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	     */
	    filter: FilterDecorator;
	    model: ModelDecorator;
	};
	export const decorators: Decorators;

}
declare module '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter' {
	import { IActionErrorHandler } from '@micro-fleet/web/dist/app/decorators/filter';
	import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class ErrorHandlerFilter implements IActionErrorHandler {
	    constructor();
	    execute(error: Error, req: Request, res: Response, next: Function): void;
	}

}
declare module '@micro-fleet/web/dist/app/filters/TenantResolverFilter' {
	import { CacheProvider } from '@micro-fleet/cache';
	import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
	import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
	import { ActionFilterBase } from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class TenantResolverFilter extends ActionFilterBase implements IActionFilter {
	    protected _cache: CacheProvider;
	    constructor(_cache: CacheProvider);
	    execute(req: Request, res: Response, next: Function): Promise<void>;
	}

}
declare module '@micro-fleet/web/dist/app/constants/Types' {
	export class Types {
	    static readonly TENANT_RESOLVER = "web.TenantResolver";
	    static readonly WEBSERVER_ADDON = "web.ExpressServerAddOn";
	}

}
declare module '@micro-fleet/web/dist/app/register-addon' {
	import { ExpressServerAddOn } from '@micro-fleet/web/dist/app/ExpressServerAddOn';
	export function registerWebAddOn(): ExpressServerAddOn;

}
declare module '@micro-fleet/web' {
	import decoratorObj = require('@micro-fleet/web/dist/app/decorators/index');
	export const decorators: decoratorObj.Decorators;
	export * from '@micro-fleet/web/dist/app/constants/MetaData';
	export { IActionFilter, IActionErrorHandler, FilterPriority, addFilterToTarget, pushFilterToArray } from '@micro-fleet/web/dist/app/decorators/filter';
	export * from '@micro-fleet/web/dist/app/interfaces';
	export * from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
	export * from '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter';
	export * from '@micro-fleet/web/dist/app/filters/ModelFilter';
	export * from '@micro-fleet/web/dist/app/filters/TenantResolverFilter';
	export * from '@micro-fleet/web/dist/app/ExpressServerAddOn';
	export * from '@micro-fleet/web/dist/app/RestControllerBase';
	export * from '@micro-fleet/web/dist/app/register-addon';
	export * from '@micro-fleet/web/dist/app/constants/Types';
	export * from '@micro-fleet/web/dist/app/WebContext';

}
declare module '@micro-fleet/web/dist/app/constants/AuthConstant' {
	 enum TokenType {
	    ACCESS = "jwt-access",
	    REFRESH = "jwt-refresh"
	}
	export { TokenType };

}
