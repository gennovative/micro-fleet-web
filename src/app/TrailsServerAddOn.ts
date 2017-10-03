import TrailsApp = require('trails');

import { injectable, inject, IDependencyContainer, Guard, HandlerContainer,
	Types as CmT } from 'back-lib-common-util';

import { serverContext } from './ServerContext';
import { MetaData } from './constants/MetaData';
import { Types as T } from './Types';



@injectable()
export class TrailsServerAddOn implements IServiceAddOn {

	public pathPrefix: string;

	protected _server: TrailsApp;
	protected _onError: Function;


	constructor(
		@inject(CmT.DEPENDENCY_CONTAINER) depContainer: IDependencyContainer,
		@inject(T.TRAILS_OPTS) protected _trailsOpts: TrailsApp.TrailsAppOts
	) {
		serverContext.setDependencyContainer(depContainer);
		this._onError = (err) => { };
	}


	public get server(): TrailsApp {
		return this._server;
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		Guard.assertIsDefined(this.pathPrefix, '`TrailsServerAddOn.pathPrefix` must be set!');
		serverContext.setPathPrefix(this.pathPrefix);

		this.registerRoutes();
		this._server = new TrailsApp(this._trailsOpts);
		serverContext.dependencyContainer.bindConstant(T.TRAILS_APP, this._server);
		return <any>this._server.start()
			.catch(err => this._server.stop(err));
	}

	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return <any>this._server.stop();
	}

	public onError(cb: (err) => void): void {
		this._onError = cb;
	}


	protected registerRoutes(): void {
		let routes: any[] = this._trailsOpts.config.routes;
		if (!routes) {
			routes = [];
		}

		for (let ctrlName of Object.getOwnPropertyNames(this._trailsOpts.api.controllers)) {
			let CtrlClass = this._trailsOpts.api.controllers[ctrlName];
			if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData.CONTROLLER, CtrlClass)) {
				continue;
			}

			this.buildControllerRoutes(CtrlClass, routes);
		}
		this._trailsOpts.config.routes = routes;
	}

	protected buildControllerRoutes(CtrlClass: Function, routes: TrailsRouteConfigItem[]): void {
		let [depIdentifier, path] = Reflect.getOwnMetadata(MetaData.CONTROLLER, CtrlClass);
		for (let actionName of Object.getOwnPropertyNames(CtrlClass.prototype)) {
			let actionFunc = CtrlClass.prototype[actionName];
			if (typeof actionFunc !== 'function' || !Reflect.hasOwnMetadata(MetaData.ACTION, actionFunc)) {
				continue;
			}

			routes.push(this.buildActionRoute(CtrlClass.prototype[actionName], path, depIdentifier));
		}
	}

	protected buildActionRoute(actionFunc: Function, controllerPath: string, controllerIdentifier: string): TrailsRouteConfigItem {
		let [method, path] = Reflect.getOwnMetadata(MetaData.ACTION, actionFunc),
			routePath = `${serverContext.pathPrefix}${controllerPath}${path}`;

		return <TrailsRouteConfigItem> {
			method,
			path: routePath,
			handler: HandlerContainer.instance.register(actionFunc.name, controllerIdentifier)
		};
	}
}