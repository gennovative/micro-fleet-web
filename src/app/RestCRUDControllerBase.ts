import * as express from 'express';
import { decorate } from 'inversify';
import * as TrailsApp from 'trails';
import TrailsController = require('trails-controller');

import { injectable, inject, unmanaged, Guard, HandlerContainer } from 'back-lib-common-util';
import {
	SettingItem, SettingItemDataType, ISoftDelRepository,
	ModelAutoMapper, JoiModelValidator, PagedArray
} from 'back-lib-common-contracts';

import { RestControllerBase, TrailsRouteConfigItem } from './RestControllerBase';
import { TenantResolver } from './TenantResolver';


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


	constructor(
		@unmanaged() trailsApp: TrailsApp,
		@unmanaged() protected _tenantResolver: TenantResolver,
		@unmanaged() protected _ClassDTO?: { new(): TModel },
		@unmanaged() protected _repo?: ISoftDelRepository<TModel, any, any>,
	) {
		super(trailsApp);
	}

	protected get validator(): JoiModelValidator<TModel> {
		return this._ClassDTO['validator'];
	}

	protected get translator(): ModelAutoMapper<TModel> {
		return this._ClassDTO['translator'];
	}

	private resolveTenant(tenantSlug: string) {
		// this._cache.
	}

	public async countAll(req: express.Request, res: express.Response) {
		console.log('Counting model');
		let payload = req.query;
		try {
			let nRows: number = await this._repo.countAll({
				tenantId: req.params.tenant
			});
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async create(req: express.Request, res: express.Response) {
		console.log('Creating model');
		let payload = req.body(),
			dto: TModel = this.translator.whole(payload.model, {
				errorCallback: details => this.validationError(res, details)
			});
		if (!dto) { return; }

		try {
			dto = await this._repo.create(dto, payload.options);
			this.created(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async deleteHard(req: express.Request, res: express.Response) {
		console.log('Hard deleting model');
		let payload = req.body(),
			[err, pk] = this.validator.pk(payload.pk);
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this._repo.deleteHard(pk, payload.options);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async deleteSoft(req: express.Request, res: express.Response) {
		console.log('Soft deleting model');
		let payload = req.body(),
			[err, pk] = this.validator.pk(payload.pk);
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this._repo.deleteSoft(pk, payload.options);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async exists(req: express.Request, res: express.Response) {
		console.log('Checking existence');
		let payload = req.body();
		try {
			let gotIt: boolean = await this._repo.exists(payload.props, payload.options);
			this.ok(res, gotIt);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async findByPk(req: express.Request, res: express.Response) {
		console.log('Finding model');
		let payload = req.body(),
			[err, pk] = this.validator.pk(payload.pk);
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let dto: TModel = await this._repo.findByPk(pk, payload.options);
			this.ok(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async recover(req: express.Request, res: express.Response) {
		console.log('Recovering model');
		let payload = req.body(),
			[err, pk] = this.validator.pk(payload.pk);
		if (!err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this._repo.recover(pk, payload.options);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async page(req: express.Request, res: express.Response) {
		console.log('Paging model');
		let payload = req.body();
		try {
			let models: PagedArray<TModel> = await this._repo.page(payload.pageIndex, payload.pageSize, payload.options);
			this.ok(res, models);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async patch(req: express.Request, res: express.Response) {
		console.log('Patching model');
		let payload = req.body(),
			model = this.translator.partial(payload.model, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedProps: Partial<TModel> = await this._repo.patch(model, payload.options);
			this.ok(res, updatedProps);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	public async update(req: express.Request, res: express.Response) {
		console.log('Updating model');
		let payload = req.body(),
			model: TModel = this.translator.whole(payload.model, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedModel: TModel = await this._repo.update(model, payload.options);
			this.ok(res, updatedModel);
		} catch (err) {
			this.internalError(res, err);
		}
	}
}