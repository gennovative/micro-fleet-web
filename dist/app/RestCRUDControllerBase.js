"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const joi = require("joi");
const common_1 = require("@micro-fleet/common");
const RestControllerBase_1 = require("./RestControllerBase");
const decorators_1 = require("./decorators");
const { action } = decorators_1.decorators;
let RestCRUDControllerBase = class RestCRUDControllerBase extends RestControllerBase_1.RestControllerBase {
    constructor(_ClassDTO) {
        super();
        this._ClassDTO = _ClassDTO;
    }
    get repo() {
        common_1.Guard.assertIsDefined(this._repo, '`this._repo` is not defined. It should be overriden by derived class with: @lazyInject(IDENTIFIER) private _repo: ISomethingRepository;');
        return this._repo;
    }
    get validator() {
        return this._ClassDTO ? this._ClassDTO['validator'] : null;
    }
    get translator() {
        return this._ClassDTO ? this._ClassDTO['translator'] : null;
    }
    //#region countAll
    async countAll(req, res) {
        try {
            let nRows = await this.doCountAll(req, res);
            this.ok(res, nRows);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doCountAll(req, res) {
        return this.repo.countAll({
            tenantId: req.params.tenantId
        });
    }
    //#endregion countAll
    //#region create
    async create(req, res) {
        const newObj = this.translator.whole(req.body.model, {
            errorCallback: details => this.validationError(res, details)
        });
        if (!newObj) {
            return;
        }
        try {
            const dto = await this.doCreate(req, res, newObj);
            this.created(res, dto);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doCreate(req, res, dto) {
        return this.repo.create(dto);
    }
    //#endregion create
    //#region deleteHard
    async deleteHard(req, res) {
        let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
        if (err) {
            this.validationError(res, err);
            return;
        }
        try {
            let nRows = await this.doDeleteHard(req, res, pk);
            this.ok(res, nRows);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doDeleteHard(req, res, pk) {
        return this.repo.deleteHard(pk);
    }
    //#endregion deleteHard
    //#region deleteSoft
    async deleteSoft(req, res) {
        let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
        if (err) {
            this.validationError(res, err);
            return;
        }
        try {
            let nRows = await this.doDeleteSoft(req, res, pk);
            this.ok(res, nRows);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doDeleteSoft(req, res, pk) {
        return this.repo.deleteSoft(pk);
    }
    //#endregion deleteSoft
    //#region exists
    async exists(req, res) {
        let uniqueProps = req.query;
        try {
            let gotIt = await this.doExists(req, res, uniqueProps);
            this.ok(res, gotIt);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doExists(req, res, uniqueProps) {
        return this.repo.exists(uniqueProps, {
            tenantId: req.params.tenantId
        });
    }
    //#endregion exists
    //#region findByPk
    async findByPk(req, res) {
        let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
        if (err) {
            this.validationError(res, err);
            return;
        }
        try {
            let dto = await this.doFindByPk(req, res, pk);
            this.ok(res, dto);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doFindByPk(req, res, pk) {
        return this.repo.findByPk(pk);
    }
    //#endregion findByPk
    //#region recover
    async recover(req, res) {
        let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
        if (err) {
            this.validationError(res, err);
            return;
        }
        try {
            let nRows = await this.doRecover(req, res, pk);
            this.ok(res, nRows);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doRecover(req, res, pk) {
        return this.repo.recover(pk);
    }
    //#endregion recover
    //#region page
    async page(req, res) {
        let pageIndex, pageSize, sortBy, sortType, error;
        try {
            ({ value: pageIndex, error } = joi.number().min(1).default(1).validate(req.params.pageIndex));
            if (error) {
                throw error;
            }
            ({ value: pageSize, error } = joi.number().min(10).max(100).default(25).validate(req.params.pageSize));
            if (error) {
                throw error;
            }
            ({ value: sortBy, error } = joi.string().min(1).validate(req.params.sortBy));
            if (error) {
                throw error;
            }
            ({ value: sortType, error } = joi.string().valid('asc', 'desc').validate(req.params.sortType));
            if (error) {
                throw error;
            }
        }
        catch (err) {
            this.validationError(res, new common_1.ValidationError(err.detail));
            return;
        }
        try {
            let result = await this.doPage(req, res, pageIndex - 1, pageSize, sortBy, sortType);
            this.ok(res, result ? result.asObject() : new common_1.PagedArray());
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doPage(req, res, pageIndex, pageSize, sortBy, sortType) {
        return this.repo.page(pageIndex, pageSize, {
            tenantId: req.params.tenantId,
            sortBy, sortType
        });
    }
    //#endregion page
    //#region patch
    async patch(req, res) {
        let model = this.translator.partial(req.body.model, {
            errorCallback: err => this.validationError(res, err)
        });
        if (!model) {
            return;
        }
        try {
            let updatedProps = await this.doPatch(req, res, model);
            this.ok(res, updatedProps);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doPatch(req, res, model) {
        return this.repo.patch(model);
    }
    //#endregion patch
    //#region update
    async update(req, res) {
        let model = this.translator.whole(req.body.model, {
            errorCallback: err => this.validationError(res, err)
        });
        if (!model) {
            return;
        }
        try {
            let updatedModel = await this.doUpdate(req, res, model);
            this.ok(res, updatedModel);
        }
        catch (err) {
            this.internalError(res, err);
        }
    }
    doUpdate(req, res, dto) {
        return this.repo.update(dto);
    }
};
__decorate([
    action('GET', 'countAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "countAll", null);
__decorate([
    action('POST'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "create", null);
__decorate([
    action('DELETE', ':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "deleteHard", null);
__decorate([
    action('DELETE', 'soft/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "deleteSoft", null);
__decorate([
    action('GET', 'exists'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "exists", null);
__decorate([
    action('GET', ':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "findByPk", null);
__decorate([
    action('GET', 'recover/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "recover", null);
__decorate([
    action('GET', 'page/:pageIndex?/:pageSize?/:sortBy?/:sortType?'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "page", null);
__decorate([
    action('PATCH', ''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "patch", null);
__decorate([
    action('PUT', ''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestCRUDControllerBase.prototype, "update", null);
RestCRUDControllerBase = __decorate([
    common_1.injectable(),
    __param(0, common_1.unmanaged()),
    __metadata("design:paramtypes", [Object])
], RestCRUDControllerBase);
exports.RestCRUDControllerBase = RestCRUDControllerBase;
//# sourceMappingURL=RestCRUDControllerBase.js.map