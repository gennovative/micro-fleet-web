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
const TrailsApp = require("trails");
const back_lib_common_util_1 = require("back-lib-common-util");
const RestControllerBase_1 = require("./RestControllerBase");
const TenantResolver_1 = require("./TenantResolver");
let RestCRUDControllerBase = class RestCRUDControllerBase extends RestControllerBase_1.RestControllerBase {
    constructor(trailsApp, _tenantResolver, _ClassDTO, _repo) {
        super(trailsApp);
        this._tenantResolver = _tenantResolver;
        this._ClassDTO = _ClassDTO;
        this._repo = _repo;
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
    get validator() {
        return this._ClassDTO['validator'];
    }
    get translator() {
        return this._ClassDTO['translator'];
    }
    resolveTenant(tenantSlug) {
        // this._cache.
    }
    countAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Counting model');
            let payload = req.query;
            try {
                let nRows = yield this._repo.countAll({
                    tenantId: req.params.tenant
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
                dto = yield this._repo.create(dto, payload.options);
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
            let payload = req.body(), [err, pk] = this.validator.pk(payload.pk);
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this._repo.deleteHard(pk, payload.options);
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
            let payload = req.body(), [err, pk] = this.validator.pk(payload.pk);
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this._repo.deleteSoft(pk, payload.options);
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
            let payload = req.body();
            try {
                let gotIt = yield this._repo.exists(payload.props, payload.options);
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
            let payload = req.body(), [err, pk] = this.validator.pk(payload.pk);
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let dto = yield this._repo.findByPk(pk, payload.options);
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
            let payload = req.body(), [err, pk] = this.validator.pk(payload.pk);
            if (!err) {
                this.validationError(res, err);
                return;
            }
            try {
                let nRows = yield this._repo.recover(pk, payload.options);
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
            let payload = req.body();
            try {
                let models = yield this._repo.page(payload.pageIndex, payload.pageSize, payload.options);
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
            let payload = req.body(), model = this.translator.partial(payload.model, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedProps = yield this._repo.patch(model, payload.options);
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
            let payload = req.body(), model = this.translator.whole(payload.model, {
                errorCallback: err => this.validationError(res, err)
            });
            if (!model) {
                return;
            }
            try {
                let updatedModel = yield this._repo.update(model, payload.options);
                this.ok(res, updatedModel);
            }
            catch (err) {
                this.internalError(res, err);
            }
        });
    }
};
RestCRUDControllerBase = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.unmanaged()),
    __param(1, back_lib_common_util_1.unmanaged()),
    __param(2, back_lib_common_util_1.unmanaged()),
    __param(3, back_lib_common_util_1.unmanaged()),
    __metadata("design:paramtypes", [TrailsApp,
        TenantResolver_1.TenantResolver, Object, Object])
], RestCRUDControllerBase);
exports.RestCRUDControllerBase = RestCRUDControllerBase;

//# sourceMappingURL=RestCRUDControllerBase.js.map
