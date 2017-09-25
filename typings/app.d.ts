/// <reference path="./global.d.ts" />

declare module 'back-lib-common-web/dist/app/RestControllerBase' {
	/// <reference types="express" />
	import * as express from 'express';
	import TrailsApp = require('trails');
	import TrailsController = require('trails-controller');
	import { ISoftDelRepository, ModelAutoMapper, JoiModelValidator } from 'back-lib-common-contracts';
	export abstract class RestControllerBase<TModel extends IModelDTO> extends TrailsController {
	    protected _ClassDTO: {
	        new (): TModel;
	    };
	    protected _repo: ISoftDelRepository<TModel, any, any>;
	    constructor(trailsApp: TrailsApp, _ClassDTO?: {
	        new (): TModel;
	    }, _repo?: ISoftDelRepository<TModel, any, any>);
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
	    protected validationError(err: any, res: express.Response): void;
	    protected internalError(err: any, res: express.Response): void;
	    protected reply(result: any, res: express.Response): void;
	}

}
declare module 'back-lib-common-web/dist/app/Types' {
	export class Types {
	    static readonly TRAILS_ADDON: string;
	    static readonly TRAILS_APP: string;
	}

}
declare module 'back-lib-common-web/dist/app/TrailsServerAddOn' {
	import TrailsApp = require('trails');
	import { IDependencyContainer } from 'back-lib-common-util';
	export class TrailsServerAddOn implements IServiceAddOn {
	    	    constructor(depContainer: IDependencyContainer, trailsOpts: TrailsApp.TrailsAppOts);
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
	}

}
declare module 'back-lib-common-web' {
	export * from 'back-lib-common-web/dist/app/RestControllerBase';
	export * from 'back-lib-common-web/dist/app/TrailsServerAddOn';
	export * from 'back-lib-common-web/dist/app/Types';

}
