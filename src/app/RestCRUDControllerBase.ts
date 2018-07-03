import * as express from 'express';
import * as joi from 'joi';

import { injectable, unmanaged, Guard, JoiModelValidator, PagedArray, 
	ValidationError, ModelAutoMapper } from '@micro-fleet/common';
import { ISoftDelRepository } from '@micro-fleet/persistence';

import { RestControllerBase } from './RestControllerBase';
import { decorators } from './decorators';
const { action } = decorators;


@injectable()
export abstract class RestCRUDControllerBase<TModel extends IModelDTO> 
	extends RestControllerBase {

	// Should be overriden by derived class with:
	// @lazyInject(IDENTIFIER) private _repo: ISomethingRepository;
	private _repo: ISoftDelRepository<TModel, any, any>;
	
	constructor(
		@unmanaged() protected _ClassDTO?: Newable<TModel>
	) {
		super();
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
		const newObj = this.translator.whole(req.body.model, {
				errorCallback: details => this.validationError(res, details)
			}) as TModel;
		if (!newObj) { return; }

		try {
			const dto = await this.doCreate(req, res, newObj);
			this.created(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doCreate(req: express.Request, res: express.Response, dto: TModel): Promise<TModel | TModel[]> {
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
			let nRows: number = await this.doDeleteHard(req, res, pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doDeleteHard(req: express.Request, res: express.Response, pk: any): Promise<number> {
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
			let nRows: number = await this.doDeleteSoft(req, res, pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doDeleteSoft(req: express.Request, res: express.Response, pk: any): Promise<number> {
		return this.repo.deleteSoft(pk);
	}

	//#endregion deleteSoft


	//#region exists

	@action('GET', 'exists')
	public async exists(req: express.Request, res: express.Response) {
		let uniqueProps = req.query;
		try {
			let gotIt: boolean = await this.doExists(req, res, uniqueProps);
			this.ok(res, gotIt);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doExists(req: express.Request, res: express.Response, uniqueProps: any): Promise<boolean> {
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
			let dto: TModel = await this.doFindByPk(req, res, pk);
			this.ok(res, dto);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doFindByPk(req: express.Request, res: express.Response, pk: any): Promise<TModel> {
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
			let nRows: number = await this.doRecover(req, res, pk);
			this.ok(res, nRows);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doRecover(req: express.Request, res: express.Response, pk: any): Promise<number> {
		return this.repo.recover(pk);
	}

	//#endregion recover


	//#region page

	@action('GET', 'page/:pageIndex?/:pageSize?/:sortBy?/:sortType?')
	public async page(req: express.Request, res: express.Response) {
		let pageIndex, pageSize, sortBy, sortType, error;
		try {
			({value: pageIndex, error} = joi.number().min(1).default(1).validate(req.params.pageIndex));
			if (error) { throw error; }

			({value: pageSize, error} = joi.number().min(10).max(100).default(25).validate(req.params.pageSize));
			if (error) { throw error; }

			({value: sortBy, error} = joi.string().min(1).validate(req.params.sortBy));
			if (error) { throw error; }

			({value: sortType, error} = joi.string().valid('asc', 'desc').validate(req.params.sortType));
			if (error) { throw error; }
		} catch (err) {
			this.validationError(res, new ValidationError(err.detail));
			return;
		}
		try {
			let result: PagedArray<TModel> = await this.doPage(req, res, pageIndex - 1, pageSize, sortBy, sortType);
			this.ok(res, result ? result.asObject() : new PagedArray<TModel>());
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doPage( req: express.Request, res: express.Response, pageIndex: number, pageSize: number, sortBy: string, sortType: 'asc' | 'desc'): Promise<PagedArray<TModel>> {
		return this.repo.page(pageIndex, pageSize, {
			tenantId: req.params.tenantId,
			sortBy, sortType
		});
	}

	//#endregion page


	//#region patch

	@action('PATCH', '')
	public async patch(req: express.Request, res: express.Response) {
		let model = this.translator.partial(req.body.model, {
				errorCallback: err => this.validationError(res, err)
			}) as Partial<TModel>;
		if (!model) { return; }

		try {
			let updatedProps = await this.doPatch(req, res, model) as Partial<TModel>;
			this.ok(res, updatedProps);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doPatch(req: express.Request, res: express.Response, model: Partial<TModel> | Partial<TModel>[]): Promise<Partial<TModel> | Partial<TModel>[]> {
		return this.repo.patch(model);
	}

	//#endregion patch


	//#region update

	@action('PUT', '')
	public async update(req: express.Request, res: express.Response) {
		let model = this.translator.whole(req.body.model, {
				errorCallback: err => this.validationError(res, err)
			}) as TModel;
		if (!model) { return; }

		try {
			let updatedModel = await this.doUpdate(req, res, model) as TModel;
			this.ok(res, updatedModel);
		} catch (err) {
			this.internalError(res, err);
		}
	}

	protected doUpdate(req: express.Request, res: express.Response, dto: TModel | TModel[]): Promise<TModel | TModel[]> {
		return this.repo.update(dto);
	}

	//#endregion update

}