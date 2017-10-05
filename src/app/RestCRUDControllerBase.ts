import * as express from 'express';
import * as joi from 'joi';
import { decorate } from 'inversify';
import * as TrailsApp from 'trails';
import TrailsController = require('trails-controller');

import { injectable, unmanaged, Guard, HandlerContainer } from 'back-lib-common-util';
import {
	SettingItem, SettingItemDataType, ISoftDelRepository,
	ModelAutoMapper, JoiModelValidator, PagedArray, ValidationError
} from 'back-lib-common-contracts';

import { RestControllerBase, TrailsRouteConfigItem } from './RestControllerBase';
import { decorators } from './decorators';
const { controller, action } = decorators;


@injectable()
export abstract class RestCRUDControllerBase<TModel extends IModelDTO> 
	extends RestControllerBase {


	/**
	 * Generates Trails routes for CRUD operations.
	 * @param {string} controllerDepIdentifier Key to look up and resolve from dependency container.
	 * @param {boolean} isSoftDel Whether to add endpoints for `deleteSoft` and `recover`.
	 * @param {string} pathPrefix Path prefix with heading slash and without trailing slash. Eg: /api/v1
	 */
	public static createRoutes(controllerDepIdentifier: string, isSoftDel: boolean, pathPrefix: string = ''): TrailsRouteConfigItem[] {
		let container = HandlerContainer.instance,
			genFn = (method, action) => {
				return RestControllerBase.createRoute(method, action,
					controllerDepIdentifier, pathPrefix, container);
			};

		let routes = [
			genFn('GET', ''),
			genFn('POST', ''),
			genFn('PUT', ''),
			genFn('PATCH', ''),
			genFn('DELETE', ''),
			genFn('GET', 'countAll'),
			genFn('GET', 'exists'),
			genFn('GET', 'findByPk'),
		];

		isSoftDel && routes.push(
			genFn('GET', 'recover')
		);

		return routes;
	}


	// Should be overriden by derived class with:
	// @lazyInject(IDENTIFIER) private _repo: ISoftDelRepository<TModel, any, any>;
	private _repo: ISoftDelRepository<TModel, any, any>;
	
	constructor(
		@unmanaged() trailsApp: TrailsApp,
		@unmanaged() protected _ClassDTO?: { new(): TModel }
	) {
		super(trailsApp);
	}

	protected get repo(): ISoftDelRepository<TModel, any, any> {
		return this._repo;
	}

	protected get validator(): JoiModelValidator<TModel> {
		return this._ClassDTO ? this._ClassDTO['validator'] : null;
	}

	protected get translator(): ModelAutoMapper<TModel> {
		return this._ClassDTO ? this._ClassDTO['translator'] : null;
	}

	private resolveTenant(tenantSlug: string) {
		// this._cache.
	}

	@action('GET', 'countAll')
	public async countAll(req: express.Request, res: express.Response) {
		console.log('Counting model');
		try {
			let nRows: number = await this.repo.countAll({
				tenantId: req.params.tenantId
			});
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('POST')
	public async create(req: express.Request, res: express.Response) {
		console.log('Creating model');
		let payload = req.body(),
			dto: TModel = this.translator.whole(payload.model, {
				errorCallback: details => this.validationError(res, details)
			});
		if (!dto) { return; }

		try {
			dto = await this.repo.create(dto);
			this.created(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('DELETE', ':id')
	public async deleteHard(req: express.Request, res: express.Response) {
		console.log('Hard deleting model');
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk({ id, tenantId });
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.repo.deleteHard(pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('DELETE', 'soft/:id')
	public async deleteSoft(req: express.Request, res: express.Response) {
		console.log('Soft deleting model');
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk({ id, tenantId });
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.repo.deleteSoft(pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('GET', 'exists')
	public async exists(req: express.Request, res: express.Response) {
		console.log('Checking existence');
		let uniqueProps = req.query;
		try {
			let gotIt: boolean = await this.repo.exists(uniqueProps, {
				tenantId: req.params.tenantId
			});
			this.ok(res, gotIt);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('GET', ':id')
	public async findByPk(req: express.Request, res: express.Response) {
		console.log('Finding model');
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk({ id, tenantId });
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let dto: TModel = await this.repo.findByPk(pk);
			this.ok(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('GET', 'recover/:id')
	public async recover(req: express.Request, res: express.Response) {
		console.log('Recovering model');
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk({ id, tenantId });
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.repo.recover(pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('GET', ':pageIndex?/:pageSize?')
	public async page(req: express.Request, res: express.Response) {
		console.log('Paging model');
		let pageIndex, pageSize;
		try {
			pageIndex = joi.number().default(1).validate(req.params.pageIndex);
			pageSize = joi.number().default(25).validate(req.params.pageSize);
		} catch (err) {
			this.validationError(res, new ValidationError(err.detail));
			return;
		}
		try {
			let models: PagedArray<TModel> = await this.repo.page(pageIndex, pageSize, {
				tenantId: req.params.tenantId
			});
			this.ok(res, models);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('PATCH', '')
	public async patch(req: express.Request, res: express.Response) {
		console.log('Patching model');
		let model = this.translator.partial(req.body, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedProps: Partial<TModel> = await this.repo.patch(model);
			this.ok(res, updatedProps);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	@action('PUT', '')
	public async update(req: express.Request, res: express.Response) {
		console.log('Updating model');
		let model: TModel = this.translator.whole(req.body, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedModel: TModel = await this.repo.update(model);
			this.ok(res, updatedModel);
		} catch (err) {
			this.internalError(res, err);
		}
	}
}