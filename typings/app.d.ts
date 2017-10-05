/// <reference path="./global.d.ts" />

declare module 'back-lib-common-web/dist/app/RestControllerBase' {
	/// <reference types="express" />
	import * as express from 'express';
	import TrailsApp = require('trails');
	import TrailsController = require('trails/controller');
	import { HandlerContainer } from 'back-lib-common-util';
	export type TrailsRouteConfigItem = {
	    method: string | string[];
	    path: string;
	    handler: string | Function;
	    config?: any;
	};
	export abstract class RestControllerBase extends TrailsController {
	    /**
	     * Generates Trails route configs to put in file app/config/routes.js
	     * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
	     * @param {string} action Action name of this route.
	     * @param {string} controllerDepIdentifier Key to look up and resolve from dependency container.
	     * @param {string} pathPrefix Path prefix with heading slash and without trailing slash. Eg: /api/v1
	     * @param {HandlerContainer} container Handler container
	     * @param {any} config Additional configuration, such as precondition policy...
	     */
	    static createRoute(method: string, action: string, controllerDepIdentifier: string, pathPrefix?: string, container?: HandlerContainer, config?: any): TrailsRouteConfigItem;
	    constructor(trailsApp: TrailsApp);
	    /*** SUCCESS ***/
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
	    /*** CLIENT ERRORS ***/
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
	    /*** SERVER ERRORS ***/
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
declare module 'back-lib-common-web/dist/app/constants/MetaData' {
	export class MetaData {
	    static readonly CONTROLLER: string;
	    static readonly CONTROLLER_FILTER: string;
	    static readonly ACTION: string;
	    static readonly ACTION_FILTER: string;
	}

}
declare module 'back-lib-common-web/dist/app/ServerContext' {
	import { IDependencyContainer } from 'back-lib-common-util';
	/**
	 * Serves as a global object for all web-related classes (controllers, policies...)
	 * to use.
	 */
	export class ServerContext {
	    	    	    /**
	     * Gets dependency container.
	     */
	    readonly dependencyContainer: IDependencyContainer;
	    /**
	     * Gets path prefix. Eg: /api/v1.
	     */
	    readonly pathPrefix: string;
	    setDependencyContainer(container: IDependencyContainer): void;
	    setPathPrefix(prefix: string): void;
	}
	export const serverContext: ServerContext;

}
declare module 'back-lib-common-web/dist/app/decorators/lazyInject' {
	export type LazyInjectDecorator = (depIdentifier: symbol | string) => Function;
	/**
	 * Injects value to the decorated property.
	 * Used to decorate properties of a class that's cannot be resolved by dependency container.
	 */
	export function lazyInject(depIdentifier: symbol | string): Function;

}
declare module 'back-lib-common-web/dist/app/decorators/controller' {
	export type ControllerDecorator = (path?: string) => Function;
	/**
	 * Used to decorate REST controller class.
	 * @param {string} path Segment of URL pointing to this controller.
	 * 		If '_' is given, it is extract from controller class name: {path}Controller.
	 * 		If not specified, it is default to be empty string.
	 */
	export function controller(path?: string): Function;

}
declare module 'back-lib-common-web/dist/app/decorators/filter' {
	import { INewable } from 'back-lib-common-util';
	export type FilterDecorator = <T>(FilterClass: new (...param: any[]) => T, filterFunc: (filter: T) => Function, priority?: number) => Function;
	/**
	 * Used to add filter to controller class and controller action.
	 * @param {class} FilterClass Filter class whose name must end with "Filter".
	 * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
	 * 		This array function won't be executed, but is used to extract filter function name.
	 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	 */
	export function filter<T>(FilterClass: INewable<T>, filterFunc: (filter: T) => Function, priority?: number): Function;
	export function addFilterToArray<T>(filters: any[], FilterClass: INewable<T>, filterFunc: (filter: T) => Function, priority?: number): void;

}
declare module 'back-lib-common-web/dist/app/decorators/action' {
	export type HttpVerbs = 'GET' | 'POST';
	export type ActionDecorator = (method?: string, path?: string) => Function;
	/**
	 * Used to decorate action function of REST controller class.
	 * @param {string} method Case-insensitive HTTP verb such as GET, POST, DELETE...
	 * @param {string} path Segment of URL pointing to this controller.
	 * 		If '_' is given, uses target function name as path.
	 * 		If not specified, it is default to be empty tring.
	 */
	export function action(method?: string, path?: string): Function;

}
declare module 'back-lib-common-web/dist/app/decorators' {
	import { LazyInjectDecorator } from 'back-lib-common-web/dist/app/decorators/lazyInject';
	import { ControllerDecorator } from 'back-lib-common-web/dist/app/decorators/controller';
	import { FilterDecorator } from 'back-lib-common-web/dist/app/decorators/filter';
	import { ActionDecorator } from 'back-lib-common-web/dist/app/decorators/action';
	export const decorators: {
	    /**
	     * Used to decorate action function of REST controller class.
	     * @param {string} path Segment of URL pointing to this controller.
	     * 		If not specified, it is default to be empty tring.
	     */
	    action: ActionDecorator;
	    /**
	     * Used to add filter to controller class and controller action.
	     * @param {class} FilterClass Filter class.
	     * @param {ExpressionStatement} filterFunc An arrow function that returns filter's function.
	     * 		This array function won't be executed, but is used to extract filter function name.
	     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	     */
	    filter: FilterDecorator;
	    /**
	     * Used to decorate REST controller class.
	     * @param {string} path Segment of URL pointing to this controller,
	     * 		if not specified, it is extract from controller class name: {path}Controller.
	     */
	    controller: ControllerDecorator;
	    /**
	     * Injects value to the decorated property.
	     * Used to decorate properties of a class that's cannot be resolved by dependency container.
	     */
	    lazyInject: LazyInjectDecorator;
	};

}
declare module 'back-lib-common-web/dist/app/RestCRUDControllerBase' {
	/// <reference types="express" />
	import * as express from 'express';
	import * as TrailsApp from 'trails';
	import { ISoftDelRepository, ModelAutoMapper, JoiModelValidator } from 'back-lib-common-contracts';
	import { RestControllerBase, TrailsRouteConfigItem } from 'back-lib-common-web/dist/app/RestControllerBase';
	export abstract class RestCRUDControllerBase<TModel extends IModelDTO> extends RestControllerBase {
	    protected _ClassDTO: {
	        new (): TModel;
	    };
	    /**
	     * Generates Trails routes for CRUD operations.
	     * @param {string} controllerDepIdentifier Key to look up and resolve from dependency container.
	     * @param {boolean} isSoftDel Whether to add endpoints for `deleteSoft` and `recover`.
	     * @param {string} pathPrefix Path prefix with heading slash and without trailing slash. Eg: /api/v1
	     */
	    static createRoutes(controllerDepIdentifier: string, isSoftDel: boolean, pathPrefix?: string): TrailsRouteConfigItem[];
	    	    constructor(trailsApp: TrailsApp, _ClassDTO?: {
	        new (): TModel;
	    });
	    protected readonly repo: ISoftDelRepository<TModel, any, any>;
	    protected readonly validator: JoiModelValidator<TModel>;
	    protected readonly translator: ModelAutoMapper<TModel>;
	    	    countAll(req: express.Request, res: express.Response): Promise<void>;
	    create(req: express.Request, res: express.Response): Promise<void>;
	    deleteHard(req: express.Request, res: express.Response): Promise<void>;
	    deleteSoft(req: express.Request, res: express.Response): Promise<void>;
	    exists(req: express.Request, res: express.Response): Promise<void>;
	    findByPk(req: express.Request, res: express.Response): Promise<void>;
	    recover(req: express.Request, res: express.Response): Promise<void>;
	    page(req: express.Request, res: express.Response): Promise<void>;
	    patch(req: express.Request, res: express.Response): Promise<void>;
	    update(req: express.Request, res: express.Response): Promise<void>;
	}

}
declare module 'back-lib-common-web/dist/app/filters/TenantResolverFilter' {
	/// <reference types="express" />
	import * as express from 'express';
	import { CacheProvider } from 'back-lib-cache-provider';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class TenantResolverFilter {
	    protected _cache: CacheProvider;
	    	    constructor(_cache: CacheProvider);
	    resolve(req: express.Request, res: express.Response, next: Function): Promise<void>;
	}

}
declare module 'back-lib-common-web/dist/app/filters/ErrorHandlerFilter' {
	/// <reference types="express" />
	import * as express from 'express';
	/**
	 * Provides method to look up tenant ID from tenant slug.
	 */
	export class ErrorHandlerFilter {
	    constructor();
	    handle(req: express.Request, res: express.Response, next: Function): void;
	}

}
declare module 'back-lib-common-web/dist/app/Types' {
	export class Types {
	    static readonly TENANT_RESOLVER: string;
	    static readonly TRAILS_ADDON: string;
	    static readonly TRAILS_APP: string;
	    static readonly TRAILS_OPTS: string;
	}

}
declare module 'back-lib-common-web/dist/app/TrailsServerAddOn' {
	import TrailsApp = require('trails');
	import { IDependencyContainer, INewable } from 'back-lib-common-util';
	export class TrailsServerAddOn implements IServiceAddOn {
	    protected _trailsOpts: TrailsApp.TrailsAppOts;
	    pathPrefix: string;
	    protected _server: TrailsApp;
	    protected _onError: Function;
	    protected _globalFilters: any[];
	    constructor(depContainer: IDependencyContainer, _trailsOpts: TrailsApp.TrailsAppOts);
	    readonly server: TrailsApp;
	    /**
	     * @see IServiceAddOn.init
	     */
	    init(): Promise<void>;
	    /**
	     * @see IServiceAddOn.deadLetter
	     */
	    deadLetter(): Promise<void>;
	    /**
	     * @see IServiceAddOn.dispose
	     */
	    dispose(): Promise<void>;
	    onError(cb: (err) => void): void;
	    addErrorHandlerFilter(): void;
	    addTenantResolverFilter(): void;
	    /**
	     * Registers a global-scoped filter which is called on every coming request.
	     * @param FilterClass
	     * @param filterFunc
	     * @param priority
	     */
	    addGlobalFilter<T>(FilterClass: INewable<T>, filterFunc: (filter: T) => Function, priority?: number): void;
	    protected buildConfig(): void;
	    protected buildControllerConfigs(CtrlClass: Function, routes: TrailsRouteConfigItem[], ctrlFilters: Function[]): void;
	    protected buildActionRoute(CtrlClass: any, actionFunc: Function, controllerPath: string): TrailsRouteConfigItem;
	    protected buildGlobalScopeFilters(): void;
	    protected buildControllerScopeFilters(CtrlClass: Function, ctrlFilters: Function[]): void;
	    protected bindFuncWithFilterInstance(FilterClass: INewable<any>, funcName: string): Function;
	    protected instantiateClass(TargetClass: INewable<any>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
	    protected instantiateClassFromContainer(TargetClass: INewable<any>, isSingleton: boolean): any;
	    protected instantiateClassTraditionally(TargetClass: INewable<any>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
	    protected buildActionFilters(CtrlClass: Function, ctrlFilters: Function[], actionFunc: Function): void;
	    protected popMetadata(metaKey: string, classOrProto: any, propName?: string): any;
	    	}

}
declare module 'back-lib-common-web' {
	export * from 'back-lib-common-web/dist/app/RestControllerBase';
	export * from 'back-lib-common-web/dist/app/RestCRUDControllerBase';
	export * from 'back-lib-common-web/dist/app/TrailsServerAddOn';
	export * from 'back-lib-common-web/dist/app/Types';
	export * from 'back-lib-common-web/dist/app/decorators';

}
