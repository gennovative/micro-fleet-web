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

	// Should be overriden by derived class with:
	// @lazyInject(IDENTIFIER) private _repo: ISomethingRepository;
	private _repo: ISoftDelRepository<TModel, any, any>;
	
	constructor(
		@unmanaged() trailsApp: TrailsApp,
		@unmanaged() protected _ClassDTO?: { new(): TModel }
	) {
		super(trailsApp);
	}

	protected get repo(): ISoftDelRepository<TModel, any, any> {
		Guard.assertIsDefined(this._repo, '`this._repo` is not defined. It should be overriden by derived class with: @lazyInject(IDENTIFIER) private _repo: ISomethingRepository;');
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

	//#region countAll

	@action('GET', 'countAll')
	public async countAll(req: express.Request, res: express.Response) {
		try {
			let nRows: number = await this.doCountAll(req, res);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doCountAll(req: express.Request, res: express.Response): Promise<number> {
		return this.repo.countAll({
			tenantId: req.params.tenantId
		});
	}

	//#endregion countAll


	//#region create

	@action('POST')
	public async create(req: express.Request, res: express.Response) {
		let dto: TModel = this.translator.whole(req.body.model, {
				errorCallback: details => this.validationError(res, details)
			});
		if (!dto) { return; }

		try {
			dto = await this.doCreate(dto, req, res);
			this.created(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doCreate(dto: TModel, req: express.Request, res: express.Response): Promise<TModel & TModel[]> {
		return this.repo.create(dto);
	}

	//#endregion create


	//#region deleteHard

	@action('DELETE', ':id')
	public async deleteHard(req: express.Request, res: express.Response) {
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
		if (err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.doDeleteHard(pk, req, res);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doDeleteHard(pk: any, req: express.Request, res: express.Response): Promise<number> {
		return this.repo.deleteHard(pk);
	}

	//#endregion deleteHard


	//#region deleteSoft

	@action('DELETE', 'soft/:id')
	public async deleteSoft(req: express.Request, res: express.Response) {
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
		if (err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.doDeleteSoft(pk, req, res);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doDeleteSoft(pk: any, req: express.Request, res: express.Response): Promise<number> {
		return this.repo.deleteSoft(pk);
	}

	//#endregion deleteSoft


	//#region exists

	@action('GET', 'exists')
	public async exists(req: express.Request, res: express.Response) {
		let uniqueProps = req.query;
		try {
			let gotIt: boolean = await this.doExists(uniqueProps, req, res);
			this.ok(res, gotIt);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doExists(uniqueProps: any, req: express.Request, res: express.Response): Promise<boolean> {
		return this.repo.exists(uniqueProps, {
			tenantId: req.params.tenantId
		});
	}

	//#endregion exists


	//#region findByPk

	@action('GET', ':id')
	public async findByPk(req: express.Request, res: express.Response) {
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
		if (err) {
			this.validationError(res, err);
			return;
		}

		try {
			let dto: TModel = await this.doFindByPk(pk, req, res);
			this.ok(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doFindByPk(pk: any, req: express.Request, res: express.Response): Promise<TModel> {
		return this.repo.findByPk(pk);
	}

	//#endregion findByPk


	//#region recover

	@action('GET', 'recover/:id')
	public async recover(req: express.Request, res: express.Response) {
		let { tenantId, id } = req.params,
			[err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
		if (err) {
			this.validationError(res, err);
			return;
		}

		try {
			let nRows: number = await this.doRecover(pk, req, res);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doRecover(pk: any, req: express.Request, res: express.Response): Promise<number> {
		return this.repo.recover(pk);
	}

	//#endregion recover


	//#region page

	@action('GET', 'page/:pageIndex?/:pageSize?')
	public async page(req: express.Request, res: express.Response) {
		let pageIndex, pageSize;
		try {
			pageIndex = joi.number().default(1).validate(req.params.pageIndex);
			pageSize = joi.number().default(25).validate(req.params.pageSize);
		} catch (err) {
			this.validationError(res, new ValidationError(err.detail));
			return;
		}
		try {
			let result: PagedArray<TModel> = await this.doPage(pageIndex, pageSize, req, res);
			this.ok(res, !result ? new PagedArray<TModel>(0) : {
				total: result.total,
				data: result
			});
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doPage(pageIndex: number, pageSize: number, req: express.Request, res: express.Response): Promise<PagedArray<TModel>> {
		return this.repo.page(pageIndex, pageSize, {
			tenantId: req.params.tenantId
		});
	}

	//#endregion page


	//#region patch

	@action('PATCH', '')
	public async patch(req: express.Request, res: express.Response) {
		let model = this.translator.partial(req.body.model, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedProps: Partial<TModel> = await this.doPatch(model, req, res);
			this.ok(res, updatedProps);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doPatch(model: Partial<TModel> & Partial<TModel>[], req: express.Request, res: express.Response): Promise<Partial<TModel> & Partial<TModel>[]> {
		return this.repo.patch(model);
	}

	//#endregion patch


	//#region update

	@action('PUT', '')
	public async update(req: express.Request, res: express.Response) {
		let model: TModel = this.translator.whole(req.body.model, {
				errorCallback: err => this.validationError(res, err)
			});
		if (!model) { return; }

		try {
			let updatedModel: TModel = await this.doUpdate(model, req, res);
			this.ok(res, updatedModel);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doUpdate(dto: TModel | TModel[], req: express.Request, res: express.Response): Promise<TModel & TModel[]> {
		return this.repo.update(dto);
	}

	//#endregion update

}