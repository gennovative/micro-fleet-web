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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const joi = require("joi");
const TrailsApp = require("trails");
const back_lib_common_util_1 = require("back-lib-common-util");
const back_lib_common_contracts_1 = require("back-lib-common-contracts");
const RestControllerBase_1 = require("./RestControllerBase");
const decorators_1 = require("./decorators");
const { controller, action } = decorators_1.decorators;
let RestCRUDControllerBase = class RestCRUDControllerBase extends RestControllerBase_1.RestControllerBase {
    constructor(trailsApp, _ClassDTO) {
        super(trailsApp);
        this._ClassDTO = _ClassDTO;
    }
    get repo() {
        back_lib_common_util_1.Guard.assertIsDefined(this._repo, '`this._repo` is not defined. It should be overriden by derived class with: @lazyInject(IDENTIFIER) private _repo: ISomethingRepository;');
        return this._repo;
    }
    get validator() {
        return this._ClassDTO ? this._ClassDTO['validator'] : null;
    }
    get translator() {
        return this._ClassDTO ? this._ClassDTO['translator'] : null;
    }
    resolveTenant(tenantSlug) {
        // this._cache.
    }
    //#region countAll
    countAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let nRows = yield this.doCountAll(req, res);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doCountAll(req, res) {
        return this.repo.countAll({
            tenantId: req.params.tenantId
        });
    }
    //#endregion countAll
    //#region create
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let dto = this.translator.whole(req.body.model, {
                errorCallback: details => this.validationError(res, details)
            });
            if (!dto) {
                return;
            }
            try {
                dto = yield this.doCreate(dto, req, res);
                this.created(res, dto);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doCreate(dto, req, res) {
        return this.repo.create(dto);
    }
    //#endregion create
    //#region deleteHard
    deleteHard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
            if (err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.doDeleteHard(pk, req, res);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doDeleteHard(pk, req, res) {
        return this.repo.deleteHard(pk);
    }
    //#endregion deleteHard
    //#region deleteSoft
    deleteSoft(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
            if (err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.doDeleteSoft(pk, req, res);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doDeleteSoft(pk, req, res) {
        return this.repo.deleteSoft(pk);
    }
    //#endregion deleteSoft
    //#region exists
    exists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let uniqueProps = req.query;
            try {
                let gotIt = yield this.doExists(uniqueProps, req, res);
                this.ok(res, gotIt);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doExists(uniqueProps, req, res) {
        return this.repo.exists(uniqueProps, {
            tenantId: req.params.tenantId
        });
    }
    //#endregion exists
    //#region findByPk
    findByPk(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
            if (err) {
                this.validationError(res, err);
                return;
            }
            try {
                let dto = yield this.doFindByPk(pk, req, res);
                this.ok(res, dto);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doFindByPk(pk, req, res) {
        return this.repo.findByPk(pk);
    }
    //#endregion findByPk
    //#region recover
    recover(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk(tenantId ? { id, tenantId } : id);
            if (err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.doRecover(pk, req, res);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doRecover(pk, req, res) {
        return this.repo.recover(pk);
    }
    //#endregion recover
    //#region page
    page(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageIndex, pageSize;
            try {
                pageIndex = joi.number().default(1).validate(req.params.pageIndex);
                pageSize = joi.number().default(25).validate(req.params.pageSize);
            }
            catch (err) {
                this.validationError(res, new back_lib_common_contracts_1.ValidationError(err.detail));
                return;
            }
            try {
                let result = yield this.doPage(pageIndex, pageSize, req, res);
                this.ok(res, !result ? new back_lib_common_contracts_1.PagedArray(0) : {
                    total: result.total,
                    data: result
                });
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doPage(pageIndex, pageSize, req, res) {
        return this.repo.page(pageIndex, pageSize, {
            tenantId: req.params.tenantId
        });
    }
    //#endregion page
    //#region patch
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.translator.partial(req.body.model, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedProps = yield this.doPatch(model, req, res);
                this.ok(res, updatedProps);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doPatch(model, req, res) {
        return this.repo.patch(model);
    }
    //#endregion patch
    //#region update
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let model = this.translator.whole(req.body.model, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedModel = yield this.doUpdate(model, req, res);
                this.ok(res, updatedModel);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    doUpdate(dto, req, res) {
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
    action('GET', 'page/:pageIndex?/:pageSize?'),
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
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.unmanaged()),
    __param(1, back_lib_common_util_1.unmanaged()),
    __metadata("design:paramtypes", [TrailsApp, Object])
], RestCRUDControllerBase);
exports.RestCRUDControllerBase = RestCRUDControllerBase;
