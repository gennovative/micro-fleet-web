import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { injectable, inject, CriticalException, IDependencyContainer, Guard, 
	Maybe, IConfigurationProvider, Types as T, constants, HandlerContainer } from '@micro-fleet/common';
const { WebSettingKeys: W } = constants;

import { MetaData } from './constants/MetaData';
import { ActionDescriptor } from './decorators/action';
import { IActionFilter, PrioritizedFilterArray, FilterArray, 
	pushFilterToArray } from './decorators/filter';
import { webContext } from './WebContext';


const INVERSIFY_INJECTABLE = 'inversify:paramtypes';
const DEFAULT_PORT = 80;
const DEFAULT_URL_PREFIX = '';

type ControllerExports = { [name: string]: Newable };

export enum ControllerCreationStrategy { SINGLETON, TRANSIENT }

@injectable()
export class ExpressServerAddOn implements IServiceAddOn {

	public readonly name: string = 'ExpressServerAddOn';

	protected _server: http.Server;
	protected _globalFilters: PrioritizedFilterArray;
	protected _isAlive: boolean;
	
	private _creationStrategy: ControllerCreationStrategy;
	private _controllerPath: string;
	private _express: express.Express;
	private _port: number;
	private _urlPrefix: string;


	//#region Getters / Setters

	/**
	 * Gets or sets strategy when creating controller instance.
	 */
	public get createStrategy(): ControllerCreationStrategy {
		return this._creationStrategy;
	}

	public set createStrategy(value: ControllerCreationStrategy) {
		this._creationStrategy = value;
	}

	/**
	 * Gets or sets path to controller classes.
	 */
	public get controllerPath(): string {
		return this._controllerPath;
	}

	public set controllerPath(value: string) {
		this._controllerPath = value;
	}

	/**
	 * Gets express instance.
	 */
	public get express(): express.Express {
		return this._express;
	}

	/**
	 * Gets HTTP port number.
	 */
	public get port(): number {
		return this._port;
	}

	/**
	 * Gets URL prefix.
	 */
	public get urlPrefix(): string {
		return this._urlPrefix;
	}

	//#endregion Getters / Setters


	constructor(
			@inject(T.CONFIG_PROVIDER) private _cfgProvider: IConfigurationProvider,
			@inject(T.DEPENDENCY_CONTAINER) private _depContainer: IDependencyContainer
		) {
		this._globalFilters = [];
		this._isAlive = false;
		this._urlPrefix = '';
		this._port = 0;
		this._express = express();
		this._creationStrategy = ControllerCreationStrategy.TRANSIENT;
		HandlerContainer.instance.dependencyContainer = _depContainer;
	}


	//#region General public methods

	/**
	 * Registers a global-scoped filter which is called on every coming request.
	 * @param FilterClass The filter class.
	 * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
	 */
	public addGlobalFilter<T extends IActionFilter>(FilterClass: Newable<T>, priority?: number): void {
		pushFilterToArray(this._globalFilters, FilterClass, priority);
	}

	/**
	 * @memberOf IServiceAddOn
	 */
	public deadLetter(): Promise<void> {
		this._isAlive = false;
		return Promise.resolve();
	}

	/**
	 * @memberOf IServiceAddOn
	 */
	public dispose(): Promise<void> {
		return <any>Promise.resolve().then(() => {
			this._server.close();
			this._server = null;
		});
	}

	//#endregion General public methods


	//#region Init

	/**
	 * @memberOf IServiceAddOn
	 */
	public init(): Promise<void> {
		this._port = this._cfgProvider.get(W.WEB_PORT).TryGetValue(DEFAULT_PORT) as number;
		this._urlPrefix = this._cfgProvider.get(W.WEB_URL_PREFIX).TryGetValue(DEFAULT_URL_PREFIX) as string;

		return <any>Promise.all([
			// Loading controllers from file takes time,
			// so we call createServer in parallel.
			this._loadControllers(),
			this._createServer(),
		]).then(([controllers, app]: [ControllerExports, express.Express]) => {
			this._initControllers(controllers, app);
			return this._startServer(app);
		});
	}

	protected _createServer(): express.Express {
		const app = this._express;

		// When `deadLetter()` is called, prevent all new requests.
		app.use((req, res, next) => {
			if (!this._isAlive) {
				return res.sendStatus(410); // Gone, https://httpstatuses.com/410
			}
			return next();
		});

		// Binds global filters as application-level middlewares to specified Express instance.
		// Binds filters with priority from 1 to 4
		this._useFilterMiddleware(this._globalFilters.filter((f, i) => i < 5), app);

		const corsOptions: cors.CorsOptions = {
			origin: this._cfgProvider.get(W.WEB_CORS).TryGetValue(false) as string | boolean,
			optionsSuccessStatus: 200,
		};
		app.use(cors(corsOptions));
		app.use(bodyParser.urlencoded({extended: true})); // Parse Form values in POST requests
		app.use(bodyParser.json()); // Parse requests with JSON payloads

		// Binds filters with priority from 5 to 10
		// All 3rd party middlewares have priority 5.
		this._useFilterMiddleware(this._globalFilters.filter((f, i) => i >= 5), app);

		return app;
	}

	protected _startServer(app: express.Express): Promise<any> {
		return new Promise((resolve, reject) => {
			this._server = app.listen(this._port, () => {
				this._isAlive = true;
				webContext.setUrlPrefix(this._urlPrefix);
				console.log('Listening on: ', this._port);
				resolve();
			});
			this._server.on('error', reject);

		});
	}

	//#endregion Init


	//#region Controller

	protected async _loadControllers(): Promise<ControllerExports> {
		const ctrlPath = this._controllerPath || path.join(process.cwd(), 'controllers');
		return await import(ctrlPath) || {};
	}

	protected _initControllers(controllers: ControllerExports, app: express.Express): void {
		for (let ctrlName of Object.getOwnPropertyNames(controllers)) {
			const CtrlClass = controllers[ctrlName];
			this._assertValidController(ctrlName, CtrlClass);
			const router = this._buildControllerRoutes(CtrlClass, app);
			this._buildControllerFilters(CtrlClass, router);
			this._initActions(CtrlClass, router);
		}
	}

	protected _buildControllerRoutes(CtrlClass: Newable, app: express.Express): express.Router {
		const [path]: [string] = this._getMetadata(MetaData.CONTROLLER, CtrlClass);
		const router = express.Router({ mergeParams: true });
		app.use(`${this._urlPrefix}${path}`, router);
		return router;
	}

	protected _buildControllerFilters(CtrlClass: Function, router: express.Router): void {
		let metaFilters: PrioritizedFilterArray = this._getMetadata(MetaData.CONTROLLER_FILTER, CtrlClass);
		this._useFilterMiddleware(metaFilters, router);
	}

	//#endregion Controller


	//#region Action

	protected _initActions(CtrlClass: Newable, router: express.Router): void {
		let allFunctions = new Map<string, Function>(),
			actionFunc;
		// Iterates over all function backwards prototype chain, except root Object.prototype
		for (let proto = CtrlClass.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
			for (let actionName of Object.getOwnPropertyNames(proto)) {
				// Make sure function in super class never overides function in derives class.
				if (allFunctions.has(actionName)) { continue; }

				const actionFunc = this._extractActionFromPrototype(proto, actionName);
				if (!actionFunc.hasValue) { continue; }

				allFunctions.set(actionName, actionFunc.value);
			}
		}
		// Destructuring to get second element (expected: [key, value])
		for ([, actionFunc] of allFunctions) {
			const proxyFn = this._proxyActionFunc(actionFunc, CtrlClass);
			this._buildActionRoutesAndFilters(proxyFn, actionFunc.name, CtrlClass, router);
		}
	}

	protected _proxyActionFunc(actionFunc: Function, CtrlClass: Newable): Function {
		let bound = this._depContainer.bind(CtrlClass.name, CtrlClass);
		if (this._creationStrategy == ControllerCreationStrategy.SINGLETON) {
			bound.asSingleton();
		}

		// Returns a proxy function that resolves the actual action function in EVERY incomming request.
		// If Controller Creation Strategy is SINGLETON, then the same controller instance will handle all requests.
		// Otherwise, a new controller instance will be created for each request.
		return HandlerContainer.instance.register(actionFunc.name, CtrlClass.name, 
			(ctrlInstance, actionName) => {
				return (actionName === actionFunc.name) && actionFunc;
			});
	}

	protected _buildActionRoutesAndFilters(actionFunc: Function, actionName: string, CtrlClass: Newable, router: express.Router): void {
		const actionDesc: ActionDescriptor = this._getMetadata(MetaData.ACTION, CtrlClass, actionName);
		const filters = this._getActionFilters(CtrlClass, actionName);
		const filterFuncs = filters.map(f => this._extractFilterExecuteFunc(f));
		
		// In case one action supports multiple methods (GET, POST etc.)
		for (let method of Object.getOwnPropertyNames(actionDesc)) {
			const routerMethod: Function = router[method];
			if (typeof routerMethod !== 'function') {
				throw new CriticalException(`Express Router doesn't support method "${method}"`);
			}
			const routePath = actionDesc[method];
			const args: any[] = [routePath, ...filterFuncs, actionFunc];
			// This is equivalent to:
			// router.METHOD(path, filter_1, filter_2, actionFunc);
			(routerMethod as Function).apply(router, args);
		}
	}

	protected _getActionFilters(CtrlClass: Function, actionName: string): FilterArray {
		const metaFilters: PrioritizedFilterArray = this._getMetadata(MetaData.ACTION_FILTER, CtrlClass, actionName);
		if (!metaFilters || !metaFilters.length) { return []; }

		// Flatten PrioritizedFilterArray structure
		const filters: FilterArray = metaFilters.reduceRight((prev: FilterArray, samePriorityFilters: FilterArray) => {
			return prev.concat(samePriorityFilters);
		}, []);

		return filters;
	}

	protected _extractActionFromPrototype(prototype: any, name: string): Maybe<Function> {
		if (!prototype || !name) { return new Maybe; }

		const isGetSetter = (proto: any, funcName: string) => {
			const desc = Object.getOwnPropertyDescriptor(proto, funcName);
			return (desc && (desc.get || desc.set));
		};
		const func = prototype[name];
		const isPureFunction = (name !== 'constructor') && (typeof func === 'function') && !isGetSetter(prototype, name);
		const isDecorated = Reflect.hasMetadata(MetaData.ACTION, prototype.constructor, name);
		return isPureFunction && isDecorated ? new Maybe(func) : new Maybe;
	}


	//#endregion Action


	//#region Filter

	private _useFilterMiddleware(filters: PrioritizedFilterArray, appOrRouter: express.Express | express.Router): void {
		if (!filters || !filters.length) { return; }
		// `reverse()`: Policies with priority of greater number should run before ones with less priority.
		// Expected format:
		// filters = [
		//		1: [ FilterClass, FilterClass ],
		//		5: [ FilterClass, FilterClass ],
		// ]
		filters.reverse().forEach(samePriorityFilters => {
			for (let FilterClass of samePriorityFilters) { // 1: [ FilterClass, FilterClass ]
				appOrRouter.use(this._extractFilterExecuteFunc(FilterClass) as express.RequestHandler);
			}
		});
	}

	protected _extractFilterExecuteFunc<T extends IActionFilter>(FilterClass: Newable<T>): Function {
		const filter: IActionFilter = this._instantiateClass(FilterClass, true);
		return filter.execute.bind(filter);
	}

	protected _instantiateClass<T extends IActionFilter>(TargetClass: Newable<T>, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): IActionFilter {
		// Create an instance either from dependency container or with normay way.
		// Make sure this instance is singleton.
		if (!Reflect.hasOwnMetadata(INVERSIFY_INJECTABLE, TargetClass)) {
			return this._instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5);
		}
		const instance = this._instantiateClassFromContainer(TargetClass, isSingleton);
		Guard.assertIsDefined(instance, 
			`Class "${TargetClass.name}" is decorated with @injectable, but cannot be resolved. 
			Make sure its class name is bound as dependency identifier, or its constructor arguments are resolved successfully.`);
		return instance;
	}

	protected _instantiateClassFromContainer(TargetClass: Newable, isSingleton: boolean): any {
		const container: IDependencyContainer = this._depContainer;
		// const container: IDependencyContainer = serviceContext.dependencyContainer;
		if (!container.isBound(TargetClass.name)) {
			const bindResult = container.bind(TargetClass.name, TargetClass);
			isSingleton && bindResult.asSingleton();
		}
		return container.resolve(TargetClass.name);
	}

	protected _instantiateClassTraditionally(TargetClass: Newable, isSingleton: boolean, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any {
		if (isSingleton) {
			return TargetClass['__instance'] ? TargetClass['__instance'] : (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5));
		}
		return new TargetClass(arg1, arg2, arg3, arg4, arg5);
	}

	protected _getMetadata(metaKey: string, classOrProto: any, propName?: string): any {
		return (propName)
			? Reflect.getMetadata(metaKey, classOrProto, propName)
			: Reflect.getOwnMetadata(metaKey, classOrProto);
	}

	//#endregion Filter


	//#region Validation

	protected _assertValidController(ctrlName: string, CtrlClass: Newable): void {
		if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData.CONTROLLER, CtrlClass)) {
			throw new CriticalException(`Controller "${ctrlName}" must be a class and decorated with @controller()`);
		}
	}

	//#endregion Validation

}