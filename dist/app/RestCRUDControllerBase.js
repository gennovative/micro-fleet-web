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
    /**
     * Generates Trails routes for CRUD operations.
     * @param {string} controllerDepIdentifier Key to look up and resolve from dependency container.
     * @param {boolean} isSoftDel Whether to add endpoints for `deleteSoft` and `recover`.
     * @param {string} pathPrefix Path prefix with heading slash and without trailing slash. Eg: /api/v1
     */
    static createRoutes(controllerDepIdentifier, isSoftDel, pathPrefix = '') {
        let container = back_lib_common_util_1.HandlerContainer.instance, genFn = (method, action) => {
            return RestControllerBase_1.RestControllerBase.createRoute(method, action, controllerDepIdentifier, pathPrefix, container);
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
        isSoftDel && routes.push(genFn('GET', 'recover'));
        return routes;
    }
    get repo() {
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
    countAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Counting model');
            try {
                let nRows = yield this.repo.countAll({
                    tenantId: req.params.tenantId
                });
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Creating model');
            let payload = req.body(), dto = this.translator.whole(payload.model, {
                errorCallback: details => this.validationError(res, details)
            });
            if (!dto) {
                return;
            }
            try {
                dto = yield this.repo.create(dto);
                this.created(res, dto);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    deleteHard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Hard deleting model');
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk({ id, tenantId });
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.repo.deleteHard(pk);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    deleteSoft(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Soft deleting model');
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk({ id, tenantId });
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.repo.deleteSoft(pk);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    exists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Checking existence');
            let uniqueProps = req.query;
            try {
                let gotIt = yield this.repo.exists(uniqueProps, {
                    tenantId: req.params.tenantId
                });
                this.ok(res, gotIt);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    findByPk(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Finding model');
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk({ id, tenantId });
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let dto = yield this.repo.findByPk(pk);
                this.ok(res, dto);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    recover(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Recovering model');
            let { tenantId, id } = req.params, [err, pk] = this.validator.pk({ id, tenantId });
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this.repo.recover(pk);
                this.ok(res, nRows);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    page(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Paging model');
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
                let models = yield this.repo.page(pageIndex, pageSize, {
                    tenantId: req.params.tenantId
                });
                this.ok(res, models);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Patching model');
            let model = this.translator.partial(req.body, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedProps = yield this.repo.patch(model);
                this.ok(res, updatedProps);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Updating model');
            let model = this.translator.whole(req.body, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedModel = yield this.repo.update(model);
                this.ok(res, updatedModel);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
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
    action('GET', ':pageIndex?/:pageSize?'),
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

//# sourceMappingURL=RestCRUDControllerBase.js.map
