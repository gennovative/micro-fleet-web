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
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const common_1 = require("@micro-fleet/common");
const MetaData_1 = require("./constants/MetaData");
const filter_1 = require("./decorators/filter");
const WebContext_1 = require("./WebContext");
const INVERSIFY_INJECTABLE = 'inversify:paramtypes';
let ExpressServerAddOn = class ExpressServerAddOn {
    //#endregion Getters / Setters
    constructor() {
        this.name = 'ExpressServerAddOn';
        this._globalFilters = [];
        this._isAlive = false;
    }
    //#region Getters / Setters
    get port() {
        return this._port;
    }
    set port(value) {
        this._port = value;
    }
    get urlPrefix() {
        return this._urlPrefix;
    }
    set urlPrefix(value) {
        this._urlPrefix = value;
    }
    //#region General public methods
    /**
     * Registers a global-scoped filter which is called on every coming request.
     * @param FilterClass The filter class.
     * @param {number} priority A number from 0 to 10, filters with greater priority run before ones with less priority.
     */
    addGlobalFilter(FilterClass, priority) {
        filter_1.pushFilterToArray(this._globalFilters, FilterClass, priority);
    }
    /**
     * @memberOf IServiceAddOn
     */
    deadLetter() {
        this._isAlive = false;
        return Promise.resolve();
    }
    /**
     * @memberOf IServiceAddOn
     */
    dispose() {
        return Promise.resolve().then(() => {
            this._server.close();
            this._server = null;
        });
    }
    //#endregion General public methods
    //#region Init
    /**
     * @memberOf IServiceAddOn
     */
    init() {
        return Promise.all([
            // Loading controllers from file takes time,
            // so we call createServer in parallel.
            this._loadControllers(),
            this._createServer(),
        ]).then(([controllers, app]) => {
            this._initControllers(controllers, app);
            this._startServer(app);
        });
    }
    _createServer() {
        const app = express();
        // When `deadLetter()` is called, prevent all new requests.
        app.use((req, res) => {
            if (!this._isAlive) {
                res.sendStatus(410); // Gone, https://httpstatuses.com/410
            }
        });
        app.use(express.urlencoded({ extended: true })); // Parse Form values in POST requests
        app.use(express.json()); // Parse requests with JSON payloads
        // Binds global filters as application-level middlewares to specified Express instance.
        this._useFilterMiddleware(this._globalFilters, app);
        return app;
    }
    _startServer(app) {
        return new Promise((resolve, reject) => {
            this._server = app.listen(this._port, () => {
                this._isAlive = true;
                WebContext_1.webContext.setUrlPrefix(this._urlPrefix);
                resolve();
            });
            this._server.on('error', reject);
        });
    }
    //#endregion Init
    //#region Controller
    async _loadControllers() {
        const ctrlPath = this._controllerPath || path.join(process.cwd(), 'controllers');
        return await Promise.resolve().then(() => require(ctrlPath)) || {};
    }
    _initControllers(controllers, app) {
        for (let ctrlName of Object.getOwnPropertyNames(controllers)) {
            const CtrlClass = controllers[ctrlName];
            this._assertValidController(ctrlName, CtrlClass);
            const router = this._buildControllerRoutes(CtrlClass, app);
            this._buildControllerFilters(CtrlClass, router);
            this._initActions(CtrlClass, router);
        }
    }
    _buildControllerRoutes(CtrlClass, app) {
        const [path] = this._popMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass);
        const router = express.Router({ mergeParams: true });
        app.use(`${this._urlPrefix}${path}`, router);
        return router;
    }
    _buildControllerFilters(CtrlClass, router) {
        let metaFilters = this._popMetadata(MetaData_1.MetaData.CONTROLLER_FILTER, CtrlClass);
        this._useFilterMiddleware(metaFilters, router);
    }
    //#endregion Controller
    //#region Action
    _initActions(CtrlClass, router) {
        let allFunctions = new Map(), actionFunc;
        // Iterates over all function in prototype chain, except root Object.prototype
        for (let proto = CtrlClass.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
            for (let actionName of Object.getOwnPropertyNames(proto)) {
                // Make sure function in super class never overides function in derives class.
                if (allFunctions.has(actionName)) {
                    continue;
                }
                const actionFunc = this._extractActionFromPrototype(proto, actionName);
                if (!actionFunc.hasValue) {
                    continue;
                }
                allFunctions.set(actionName, actionFunc.value);
            }
        }
        // Destructuring to get second element (expected: [key, value])
        for ([, actionFunc] of allFunctions) {
            this._buildActionRoutesAndFilters(actionFunc, CtrlClass, router);
        }
    }
    _buildActionRoutesAndFilters(actionFunc, CtrlClass, router) {
        const [method, path] = this._popMetadata(MetaData_1.MetaData.ACTION, CtrlClass, actionFunc.name);
        const routerMethod = router[method.toLowerCase()];
        if (!(typeof routerMethod !== 'function')) {
            throw new common_1.CriticalException(`Express Router doesn't support method "${method}"`);
        }
        const filters = this._getActionFilters(CtrlClass, actionFunc.name);
        const args = [path];
        // This is equivalent to:
        // router.METHOD(path, filter_1, filter_2, actionFunc);
        routerMethod.apply(router, args.concat(filters).push(actionFunc));
    }
    _getActionFilters(CtrlClass, actionName) {
        const metaFilters = this._popMetadata(MetaData_1.MetaData.ACTION_FILTER, CtrlClass, actionName);
        if (!metaFilters || !metaFilters.length) {
            return [];
        }
        // Flatten PrioritizedFilterArray structure
        const filters = metaFilters.reduceRight((prev, samePriorityFilters) => {
            return prev.concat(samePriorityFilters);
        }, []);
        return filters;
    }
    _extractActionFromPrototype(prototype, name) {
        if (!prototype || !name) {
            return new common_1.Maybe;
        }
        const isGetSetter = (proto, funcName) => {
            const desc = Object.getOwnPropertyDescriptor(proto, funcName);
            return (desc && (desc.get || desc.set));
        };
        const func = prototype[name];
        const isPureFunction = (name !== 'constructor') && (typeof func === 'function') && !isGetSetter(prototype, name);
        const isDecorated = Reflect.hasMetadata(MetaData_1.MetaData.ACTION, prototype.constructor, name);
        return isPureFunction && isDecorated ? new common_1.Maybe(func) : new common_1.Maybe;
    }
    //#endregion Action
    //#region Filter
    _useFilterMiddleware(filters, appOrRouter) {
        if (!filters || !filters.length) {
            return;
        }
        // `reverse()`: Policies with priority of greater number should run before ones with less priority.
        // Expected format:
        // filters = [
        //		1: [ FilterClass, FilterClass ],
        //		5: [ FilterClass, FilterClass ],
        // ]
        filters.reverse().forEach(samePriorityFilters => {
            for (let FilterClass of samePriorityFilters) { // 1: [ FilterClass, FilterClass ]
                appOrRouter.use(this._extractFilterExecuteFunc(FilterClass));
            }
        });
    }
    _extractFilterExecuteFunc(FilterClass) {
        const filter = this._instantiateClass(FilterClass, true);
        return filter.execute.bind(filter);
    }
    _instantiateClass(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5) {
        // Create an instance either from dependency container or with normay way.
        // Make sure this instance is singleton.
        if (!Reflect.hasOwnMetadata(INVERSIFY_INJECTABLE, TargetClass)) {
            return this._instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5);
        }
        const instance = this._instantiateClassFromContainer(TargetClass, isSingleton);
        common_1.Guard.assertIsDefined(instance, `Class "${TargetClass.name}" is decorated with @injectable, but cannot be resolved. 
			Make sure its class name is bound as dependency identifier, or its constructor arguments are resolved successfully.`);
        return instance;
    }
    _instantiateClassFromContainer(TargetClass, isSingleton) {
        const container = common_1.serviceContext.dependencyContainer;
        if (!container.isBound(TargetClass.name)) {
            const bindResult = container.bind(TargetClass.name, TargetClass);
            isSingleton && bindResult.asSingleton();
        }
        return container.resolve(TargetClass.name);
    }
    _instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5) {
        if (isSingleton) {
            return TargetClass['__instance'] ? TargetClass['__instance'] : (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5));
        }
        return new TargetClass(arg1, arg2, arg3, arg4, arg5);
    }
    _popMetadata(metaKey, classOrProto, propName) {
        const metadata = (propName)
            ? Reflect.getMetadata(metaKey, classOrProto, propName)
            : Reflect.getOwnMetadata(metaKey, classOrProto);
        Reflect.deleteMetadata(metaKey, classOrProto, propName);
        return metadata;
    }
    //#endregion Filter
    //#region Validation
    _assertValidController(ctrlName, CtrlClass) {
        if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass)) {
            throw new common_1.CriticalException(`Controller "${ctrlName}" must be a class and decorated with @controller()`);
        }
    }
};
ExpressServerAddOn = __decorate([
    common_1.injectable(),
    __metadata("design:paramtypes", [])
], ExpressServerAddOn);
exports.ExpressServerAddOn = ExpressServerAddOn;
//# sourceMappingURL=ExpressServerAddOn.js.map