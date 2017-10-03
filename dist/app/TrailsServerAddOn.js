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
const TrailsApp = require("trails");
const back_lib_common_util_1 = require("back-lib-common-util");
const ServerContext_1 = require("./ServerContext");
const MetaData_1 = require("./constants/MetaData");
const Types_1 = require("./Types");
let TrailsServerAddOn = class TrailsServerAddOn {
    constructor(depContainer, _trailsOpts) {
        this._trailsOpts = _trailsOpts;
        ServerContext_1.serverContext.setDependencyContainer(depContainer);
        this._onError = (err) => { };
    }
    get server() {
        return this._server;
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        back_lib_common_util_1.Guard.assertIsDefined(this.pathPrefix, '`TrailsServerAddOn.pathPrefix` must be set!');
        ServerContext_1.serverContext.setPathPrefix(this.pathPrefix);
        this.registerRoutes();
        this._server = new TrailsApp(this._trailsOpts);
        ServerContext_1.serverContext.dependencyContainer.bindConstant(Types_1.Types.TRAILS_APP, this._server);
        return this._server.start()
            .catch(err => this._server.stop(err));
    }
    /**
     * @see IServiceAddOn.deadLetter
     */
    deadLetter() {
        return Promise.resolve();
    }
    /**
     * @see IServiceAddOn.dispose
     */
    dispose() {
        return this._server.stop();
    }
    onError(cb) {
        this._onError = cb;
    }
    registerRoutes() {
        let routes = this._trailsOpts.config.routes;
        if (!routes) {
            routes = [];
        }
        for (let ctrlName of Object.getOwnPropertyNames(this._trailsOpts.api.controllers)) {
            let CtrlClass = this._trailsOpts.api.controllers[ctrlName];
            if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass)) {
                continue;
            }
            this.buildControllerRoutes(CtrlClass, routes);
        }
        this._trailsOpts.config.routes = routes;
    }
    buildControllerRoutes(CtrlClass, routes) {
        let [depIdentifier, path] = Reflect.getOwnMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass);
        for (let actionName of Object.getOwnPropertyNames(CtrlClass.prototype)) {
            let actionFunc = CtrlClass.prototype[actionName];
            if (typeof actionFunc !== 'function' || !Reflect.hasOwnMetadata(MetaData_1.MetaData.ACTION, actionFunc)) {
                continue;
            }
            routes.push(this.buildActionRoute(CtrlClass.prototype[actionName], path, depIdentifier));
        }
    }
    buildActionRoute(actionFunc, controllerPath, controllerIdentifier) {
        let [method, path] = Reflect.getOwnMetadata(MetaData_1.MetaData.ACTION, actionFunc), routePath = `${ServerContext_1.serverContext.pathPrefix}${controllerPath}${path}`;
        return {
            method,
            path: routePath,
            handler: back_lib_common_util_1.HandlerContainer.instance.register(actionFunc.name, controllerIdentifier)
        };
    }
};
TrailsServerAddOn = __decorate([
    back_lib_common_util_1.injectable(),
    __param(0, back_lib_common_util_1.inject(back_lib_common_util_1.Types.DEPENDENCY_CONTAINER)),
    __param(1, back_lib_common_util_1.inject(Types_1.Types.TRAILS_OPTS)),
    __metadata("design:paramtypes", [Object, Object])
], TrailsServerAddOn);
exports.TrailsServerAddOn = TrailsServerAddOn;

//# sourceMappingURL=TrailsServerAddOn.js.map
