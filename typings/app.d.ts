/// <reference path="./global.d.ts" />
declare module '@micro-fleet/web/dist/app/constants/MetaData' {
    export enum MetaData {
        CONTROLLER = "micro-fleet-web:controller",
        CONTROLLER_FILTER = "micro-fleet-web:controllerFilter",
        ACTION = "micro-fleet-web:action",
        ACTION_FILTER = "micro-fleet-web:actionFilter",
        PARAM_DECOR = "micro-fleet-web:paramDecor"
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
     * @param {string} verb Case-insensitive HTTP verb supported by Express
         *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function action(verb: string, path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts request of ALL verbs.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function ALL(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts GET request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function GET(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts POST request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function POST(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts PUT request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function PUT(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts PATCH request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function PATCH(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts DELETE request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function DELETE(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts HEAD request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function HEAD(path?: string): PropertyDecorator;
    /**
     * Used to decorate an action that accepts OPTIONS request.
     * @param {string} path Segment of URL pointing to this action.
     *         If not specified, it is default to be the action's function name.
     */
    export function OPTIONS(path?: string): PropertyDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/filter' {
    import { RequestHandler } from 'express';
    import { Newable } from '@micro-fleet/common';
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
    /**
     * Represents an array of MicroFleet filter classes or Express middlewares.
     */
    export type FilterArray<T extends ActionInterceptor = ActionInterceptor> = {
        FilterClass: Newable<T> | RequestHandler;
        filterParams: any[];
    }[];
    export type PrioritizedFilterArray = FilterArray[];
    /**
     * Marks the given Class as MicroFleet filter class.
     */
    export function markAsFilterClass(Class: object | Function): boolean;
    /**
     * Checks if the given Class is a MicroFleet filter class.
     */
    export function isFilterClass(Class: object | Function): boolean;
    /**
     * Used to add filter to controller class and controller action.
     * If you want to add raw Express middleware, use @middleware() instead.
     * @param {class} FilterClass Filter class whose name must end with "Filter".
     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
     */
    export function filter<T extends ActionInterceptor>(FilterClass: Newable<T>, priority?: FilterPriority, ...filterParams: any[]): Function;
    /**
     * Used to add Express middleware to controller class and controller action.
     * All Express middlewares are of FilterPriority.MEDIUM.
     */
    export function middleware(handler: RequestHandler): PropertyDecorator | ClassDecorator;
    /**
     * Adds a filter to `TargetClass`. `TargetClass` can be a class or class prototype,
     * depending on whether the filter is meant to apply on class or class method.
     * @param FilterClassOrMiddleware The filter class or Express middleware.
     * @param TargetClassOrPrototype A class or class prototype.
     * @param targetFunc Method name, if `TargetClass` is prototype object,
     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
     */
    export function addFilterToTarget<T extends ActionInterceptor>(FilterClassOrMiddleware: Newable<T> | RequestHandler, TargetClassOrPrototype: Newable<T>, targetFunc?: string | symbol, priority?: FilterPriority, ...filterParams: any[]): new (...args: any[]) => T;
    /**
     * Prepares a filter then push it to given array.
     */
    export function pushFilterToArray<T extends ActionInterceptor>(filters: PrioritizedFilterArray, FilterClassOrMiddleware: Newable<T> | RequestHandler, priority?: FilterPriority, ...filterParams: any[]): void;

}
declare module '@micro-fleet/web/dist/app/interfaces' {
    import * as express from 'express';
    export interface RequestExtras {
        /**
         * Object attached by global filter `TenantResolverFilter`
         */
        readonly tenantId?: string;
    }
    export interface Request extends express.Request {
        /**
         * Contains custom objects.
         *
         * If any @micro-fleet filter wants to attach new property(-es) to
         * request object, it should attach here.
         */
        readonly extras: RequestExtras;
    }
    export interface Response extends express.Response {
    }

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
declare module '@micro-fleet/web/dist/app/decorators/param-decor-base' {
    import { Newable } from '@micro-fleet/common';
    import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
    export type ParseFunction = (input: any) => any;
    export type DecorateParamOptions = {
        /**
         * The class that has the method to which the decorated parameter belongs.
         */
        TargetClass: Newable;
        /**
         * The function name whose signature contains the decorated parameter.
         */
        method: string | symbol;
        /**
         * Position of the decorated parameter in function signature.
         */
        paramIndex: number;
        /**
         * The function to figure out the value for the decorated parameter
         */
        resolverFn(req: Request, res: Response): Promise<any> | any;
    };
    export type ParamDecorDescriptor = Function[];
    /**
     * Stored the `resolverFn` for later use to resolve value for
     * param `paramIndex` of the `method` of `TargetClass`.
     */
    export function decorateParam(opts: DecorateParamOptions): void;
    export function getParamType(proto: any, method: string | symbol, paramIndex: number): any;
    export function identity(val: any): any;
    export function primitiveParserFactory(proto: any, method: string | symbol, paramIndex: number): ParseFunction;

}
declare module '@micro-fleet/web/dist/app/decorators/response' {
    export const RES_INJECTED: unique symbol;
    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current response object
     */
    export function response(): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/ExpressServerAddOn' {
    /// <reference types="node" />
    import * as http from 'http';
    import * as express from 'express';
    import { IDependencyContainer, Maybe, IConfigurationProvider, Newable, IServiceAddOn, PrimitiveType } from '@micro-fleet/common';
    import { IActionErrorHandler, ActionInterceptor, PrioritizedFilterArray, FilterArray, FilterPriority } from '@micro-fleet/web/dist/app/decorators/filter';
    import { Request, Response } from '@micro-fleet/web/dist/app/interfaces'; type ControllerExports = {
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
        /**
         * Whether to delete decorator metadata after initialization.
         */
        cleanUpDecorators: boolean;
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
        protected _resolveParamValues(CtrlClass: Newable, actionName: string, req: Request, res: Response): Promise<any[]>;
        protected _autoRespond(actionResult: any, res: Response, next: Function): void;
        protected _buildActionRoutesAndFilters(actionFunc: Function, actionName: string, CtrlClass: Newable, router: express.Router): void;
        protected _getActionFilters(CtrlClass: Function, actionName: string): FilterArray;
        protected _extractActionFromPrototype(prototype: any, name: string): Maybe<Function>;
        protected _useFilters(filters: PrioritizedFilterArray, appOrRouter: express.Express | express.Router, routePath?: string): void;
        protected _useErrorHandlerMiddleware(handlers: Newable[], appOrRouter: express.Express | express.Router): void;
        protected _extractFilterExecuteFunc<TFilter extends ActionInterceptor>(FilterClassOrMiddleware: Newable<TFilter> | express.RequestHandler, filterParams: any[], paramLength?: number): Function;
        protected _instantiateClass<TTarget extends ActionInterceptor>(TargetClass: Newable<TTarget>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): ActionInterceptor;
        protected _instantiateClassFromContainer(TargetClass: Newable, isSingleton: boolean): any;
        protected _instantiateClassTraditionally(TargetClass: Newable, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
        protected _getMetadata(metaKey: string, classOrProto: any, propName?: string): any;
        protected _assertValidController(ctrlName: string, CtrlClass: Newable): void;
        protected _shouldIgnoreController(ctrlName: string): boolean;
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
         * Responds as No Content with status code 204 and optional data.
         * @param res Express response object.
         * @param data Data to optionally return to client.
         */
        protected noContent(res: Response, data?: any): void;
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
declare module '@micro-fleet/web/dist/app/constants/Types' {
    export class Types {
        static readonly TENANT_RESOLVER = "web.TenantResolver";
        static readonly WEBSERVER_ADDON = "web.ExpressServerAddOn";
    }

}
declare module '@micro-fleet/web/dist/app/decorators/controller' {
    export type ControllerDecorator = (path?: string) => Function;
    /**
     * Used to decorate REST controller class.
     * @param {string} path Segment of URL pointing to this controller.
     *         If not specified, it is extracted from controller class name: {path}Controller,
     *         and converted to all lowercase.
     */
    export function controller(path?: string): ClassDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/model' {
    import { ITranslatable } from '@micro-fleet/common';
    import { Request } from '@micro-fleet/web/dist/app/interfaces';
    export type ModelDecoratorOptions = {
        /**
         * Function to extract model object from request body.
         */
        extractFn?(request: Request): any;
        /**
         * Function to be called after model is created with desired type,
         * and before assigned as parameter value.
         */
        postProcessFn?(model: any, request: Request): void;
        /**
         * Turns on or off model validation before translating.
         * Default to use translator's `enableValidation` property.
         */
        enableValidation?: boolean;
        /**
         * Whether this request contains just some properties of model class.
         * Default: false (request contains all props)
         */
        isPartial?: boolean;
        /**
         * If the expected model is an array, the array item type must
         * be specified here.
         */
        ItemClass?: ITranslatable;
    };
    /**
     * For action parameter decoration.
     * Attempts to translate request body to desired model class,
     * then attaches to the parameter's value.
     * @param opts Can be the Model Class or option object.
     */
    export function model(opts?: ITranslatable | ModelDecoratorOptions): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/extras' {
    /**
     * For action parameter decoration.
     *
     * Will resolve the parameter's value with selected property from `request.extras`.
     *
     * @param {string} name A key whose value will be extracted from `request.extras`.
     *     If not specified, the whole object will be returned, equivalent to `request.extras`.
     */
    export function extras(name?: string): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/header' {
    import { ParseFunction } from '@micro-fleet/web/dist/app/decorators/param-decor-base';
    /**
     * For action parameter decoration.
     * Will resolve the parameter's value with header value from `request.headers`.
     * @param {string} name Case-insensitive header name.
     *    If not specified, the deserialized headers object will be returned, equivalent to `request.headers`.
     * @param {ParseFunction} parseFn Function to parse the value or array items.
     *    If not given, a default function will attempt to parse based on param type.
     *    This parameter is ignored if `name` is not specified.
     * @param {string} listDelimiter If provided, use this as delimiter to split the value to array or strings.
     *     This parameter is ignored if `name` is not specified.
     */
    export function header(name?: string, parseFn?: ParseFunction, listDelimiter?: string): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/request' {
    /**
     * For action parameter decoration.
     * Resolves the parameter's value with the current request object
     */
    export function request(): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/param' {
    import { ParseFunction } from '@micro-fleet/web/dist/app/decorators/param-decor-base';
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
    export function param(name?: string, parseFn?: ParseFunction): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators/query' {
    import { ParseFunction } from '@micro-fleet/web/dist/app/decorators/param-decor-base';
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
    export function query(name?: string, parseFn?: ParseFunction): ParameterDecorator;

}
declare module '@micro-fleet/web/dist/app/decorators' {
    import * as act from '@micro-fleet/web/dist/app/decorators/action';
    import { controller } from '@micro-fleet/web/dist/app/decorators/controller';
    import * as m from '@micro-fleet/web/dist/app/decorators/model';
    import { extras } from '@micro-fleet/web/dist/app/decorators/extras';
    import { filter, middleware } from '@micro-fleet/web/dist/app/decorators/filter';
    import { header } from '@micro-fleet/web/dist/app/decorators/header';
    import { request } from '@micro-fleet/web/dist/app/decorators/request';
    import { response } from '@micro-fleet/web/dist/app/decorators/response';
    import { param } from '@micro-fleet/web/dist/app/decorators/param';
    import { query } from '@micro-fleet/web/dist/app/decorators/query';
    export * from '@micro-fleet/web/dist/app/decorators/param-decor-base';
    export type ModelDecoratorOptions = m.ModelDecoratorOptions;
    export type Decorators = {
        /**
         * Used to decorate an action that accepts request of ALL verbs.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        ALL: typeof act.ALL;
        /**
         * Used to decorate an action that accepts DELETE request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        DELETE: typeof act.DELETE;
        /**
         * Used to decorate an action that accepts GET request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        GET: typeof act.GET;
        /**
         * Used to decorate an action that accepts POST request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        POST: typeof act.POST;
        /**
         * Used to decorate an action that accepts PATCH request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        PATCH: typeof act.PATCH;
        /**
         * Used to decorate an action that accepts PUT request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        PUT: typeof act.PUT;
        /**
         * Used to decorate an action that accepts HEAD request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        HEAD: typeof act.HEAD;
        /**
         * Used to decorate an action that accepts OPTIONS request.
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        OPTIONS: typeof act.OPTIONS;
        /**
         * Used to decorate action function of REST controller class.
         * @param {string} method Case-insensitive HTTP verb supported by Express
         *         (see full list at https://expressjs.com/en/4x/api.html#routing-methods)
         * @param {string} path Segment of URL pointing to this action.
         *         If not specified, it is default to be the action's function name.
         */
        action: typeof act.action;
        /**
         * Used to decorate REST controller class.
         * @param {string} path Segment of URL pointing to this controller,
         *         if not specified, it is extract from controller class name: {path}Controller.
         */
        controller: typeof controller;
        /**
         * Used to add filter to controller class and controller action.
         * @param {class} FilterClass Filter class.
         * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
         *         This array function won't be executed, but is used to extract filter function name.
         * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
         */
        filter: typeof filter;
        /**
         * Used to add Express middleware to controller class and controller action.
         * Middlewares run before all Micro Fleet filters.
         */
        middleware: typeof middleware;
        /**
         * For action parameter decoration.
         *
         * Will resolve the parameter's value with selected property from `request.extras`.
         *
         * @param {string} name A key whose value will be extracted from `request.extras`.
         *     If not specified, the whole object will be returned, equivalent to `request.extras`.
         */
        extras: typeof extras;
        header: typeof header;
        /**
         * For action parameter decoration.
         * Attempts to translate request body to desired model class,
         * then attaches to the parameter's value.
         */
        model: typeof m.model;
        /**
         * For action parameter decoration.
         * Resolves the parameter's value with the current request object
         */
        request: typeof request;
        /**
         * For action parameter decoration.
         * Resolves the parameter's value with the current response object
         */
        response: typeof response;
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
        param: typeof param;
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
        query: typeof query;
    };
    export const decorators: Decorators;

}
declare module '@micro-fleet/web/dist/app/filters/ActionFilterBase' {
    export abstract class ActionFilterBase {
        protected addReadonlyProp(obj: object, prop: string, value: any): void;
    }

}
declare module '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter' {
    import { IActionErrorHandler } from '@micro-fleet/web/dist/app/decorators/filter';
    import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
    /**
     * Catches unhandled exceptions from action methods.
     */
    export class ErrorHandlerFilter implements IActionErrorHandler {
        execute(error: Error, req: Request, res: Response, next: Function): void;
    }

}
declare module '@micro-fleet/web/dist/app/mock-for-test' {
    import { IConfigurationProvider, IDependencyContainer } from '@micro-fleet/common';
    import { ExpressServerAddOn } from '@micro-fleet/web/dist/app/ExpressServerAddOn';
    /**
     * Creates a mock instance of ExpressServerAddOn
     */
    export function createExpressMockServer(options?: CreateExpressMockServerOptions): CreateExpressMockServerResult;
    export type CreateExpressMockServerOptions = {
        /**
         * Data for configuration provider.
         */
        configs?: object;
        /**
         * Factory function to create dependency container.
         */
        createDependencyContainer?(): IDependencyContainer;
        /**
         * Factory function to create configuration container.
         * @param configs This is `configs` option.
         * @param depContainer This is the container created by the option `createDependencyContainer()`.
         */
        createConfigurationProvider?(configs: object, depContainer: IDependencyContainer): IConfigurationProvider;
    };
    export type CreateExpressMockServerResult = {
        server: ExpressServerAddOn;
        configProvider: IConfigurationProvider;
        depContainer: IDependencyContainer;
    };

}
declare module '@micro-fleet/web/dist/app/register-addon' {
    import { ExpressServerAddOn } from '@micro-fleet/web/dist/app/ExpressServerAddOn';
    export type RegisterOptions = {
        /**
         * Whether to add `ErrorHandlerFilter` to addon.
         *
         * Default is true. Turn this off if you want to add your own error handler.
         */
        useDefaultErrorHandler?: boolean;
    };
    export function registerWebAddOn(opts?: RegisterOptions): ExpressServerAddOn;

}
declare module '@micro-fleet/web' {
    export * from '@micro-fleet/web/dist/app/constants/MetaData';
    export * from '@micro-fleet/web/dist/app/constants/Types';
    export * from '@micro-fleet/web/dist/app/decorators';
    export { IActionFilter, IActionErrorHandler, FilterPriority, addFilterToTarget, pushFilterToArray } from '@micro-fleet/web/dist/app/decorators/filter';
    export * from '@micro-fleet/web/dist/app/ExpressServerAddOn';
    export * from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
    export * from '@micro-fleet/web/dist/app/filters/ErrorHandlerFilter';
    export * from '@micro-fleet/web/dist/app/interfaces';
    export * from '@micro-fleet/web/dist/app/mock-for-test';
    export * from '@micro-fleet/web/dist/app/RestControllerBase';
    export * from '@micro-fleet/web/dist/app/register-addon';
    export * from '@micro-fleet/web/dist/app/WebContext';

}
declare module '@micro-fleet/web/dist/app/constants/AuthConstant' {
     enum TokenType {
        ACCESS = "jwt-access",
        REFRESH = "jwt-refresh"
    }
    export { TokenType };

}
declare module '@micro-fleet/web/dist/app/decorators/tenantId' {
    import { Maybe } from '@micro-fleet/common';
    import { Request } from '@micro-fleet/web/dist/app/interfaces';
    export type TenantIdDecorator = () => Function;
    /**
     * Attempts to get tenant ID from tenant slug in request params.
     */
    export function extractTenantId(req: Request): Promise<Maybe<string>>;
    export function tenantId(): Function;

}
declare module '@micro-fleet/web/dist/app/filters/TenantResolverFilter' {
    import { IActionFilter } from '@micro-fleet/web/dist/app/decorators/filter';
    import { Request, Response } from '@micro-fleet/web/dist/app/interfaces';
    import { ActionFilterBase } from '@micro-fleet/web/dist/app/filters/ActionFilterBase';
    /**
     * Provides method to look up tenant ID from tenant slug.
     */
    export class TenantResolverFilter extends ActionFilterBase implements IActionFilter {
        constructor();
        execute(req: Request, res: Response, next: Function): Promise<void>;
    }

}
