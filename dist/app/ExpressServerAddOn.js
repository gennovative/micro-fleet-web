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
const cors = require("cors");
const common_1 = require("@micro-fleet/common");
const { WebSettingKeys: W } = common_1.constants;
const MetaData_1 = require("./constants/MetaData");
const filter_1 = require("./decorators/filter");
const WebContext_1 = require("./WebContext");
const INVERSIFY_INJECTABLE = 'inversify:paramtypes';
const DEFAULT_PORT = 80;
const DEFAULT_URL_PREFIX = '';
var ControllerCreationStrategy;
(function (ControllerCreationStrategy) {
    ControllerCreationStrategy[ControllerCreationStrategy["SINGLETON"] = 0] = "SINGLETON";
    ControllerCreationStrategy[ControllerCreationStrategy["TRANSIENT"] = 1] = "TRANSIENT";
})(ControllerCreationStrategy = exports.ControllerCreationStrategy || (exports.ControllerCreationStrategy = {}));
let ExpressServerAddOn = class ExpressServerAddOn {
    //#endregion Getters / Setters
    constructor() {
        this.name = 'ExpressServerAddOn';
        this._globalFilters = [];
        this._globalErrorHandlers = [];
        this._isAlive = false;
        this._urlPrefix = '';
        this._port = 0;
        this._express = express();
        this._creationStrategy = ControllerCreationStrategy.TRANSIENT;
    }
    //#region Getters / Setters
    /**
     * Gets or sets strategy when creating controller instance.
     */
    get controllerCreation() {
        return this._creationStrategy;
    }
    set controllerCreation(value) {
        this._creationStrategy = value;
    }
    /**
     * Gets or sets path to controller classes.
     */
    get controllerPath() {
        return this._controllerPath;
    }
    set controllerPath(value) {
        this._controllerPath = value;
    }
    /**
     * Gets express instance.
     */
    get express() {
        return this._express;
    }
    /**
     * Gets HTTP port number.
     */
    get port() {
        return this._port;
    }
    /**
     * Gets URL prefix.
     */
    get urlPrefix() {
        return this._urlPrefix;
    }
    //#region General public methods
    /**
     * Registers a global-scoped filter which is called on every coming request.
     * @param FilterClass The filter class.
     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
     */
    addGlobalFilter(FilterClass, priority) {
        filter_1.pushFilterToArray(this._globalFilters, FilterClass, priority);
    }
    /**
     * Registers a global-scoped error handler which catches error from filters and actions.
     * @param HandlerClass The error handler class.
     */
    addGlobalErrorHandler(HandlerClass) {
        this._globalErrorHandlers.push(HandlerClass);
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
        WebContext_1.webContext.setUrlPrefix(this._urlPrefix);
        this._port = this._cfgProvider.get(W.WEB_PORT).TryGetValue(DEFAULT_PORT);
        this._urlPrefix = this._cfgProvider.get(W.WEB_URL_PREFIX).TryGetValue(DEFAULT_URL_PREFIX);
        return Promise.all([
            // Loading controllers from file takes time,
            // so we call createServer in parallel.
            this._loadControllers(),
            this._createServer(),
        ]).then(([controllers, app]) => {
            this._initControllers(controllers, app);
            this._useErrorHandlerMiddleware(this._globalErrorHandlers, app);
            return this._startServer(app);
        });
    }
    _createServer() {
        const app = this._express;
        app.disable('x-powered-by');
        // When `deadLetter()` is called, prevent all new requests.
        app.use((req, res, next) => {
            if (!this._isAlive) {
                return res.sendStatus(410); // Gone, https://httpstatuses.com/410
            }
            return next();
        });
        // Binds global filters as application-level middlewares to specified Express instance.
        // Binds filters with priority HIGH
        this._useFilterMiddleware(this._globalFilters.filter((f, i) => i == filter_1.FilterPriority.HIGH), app);
        const corsOptions = {
            origin: this._cfgProvider.get(W.WEB_CORS).TryGetValue(false),
            optionsSuccessStatus: 200,
        };
        app.use(cors(corsOptions));
        app.use(express.urlencoded({ extended: true })); // Parse Form values in POST requests
        app.use(express.json()); // Parse requests with JSON payloads
        // Binds filters with priority from MEDIUM to LOW
        // All 3rd party middlewares have priority MEDIUM.
        this._useFilterMiddleware(this._globalFilters.filter((f, i) => i == filter_1.FilterPriority.MEDIUM || i == filter_1.FilterPriority.LOW), app);
        return app;
    }
    _startServer(app) {
        return new Promise((resolve, reject) => {
            this._server = app.listen(this._port, () => {
                this._isAlive = true;
                console.log('Listening on: ', this._port);
                resolve();
            });
            this._server.on('error', reject);
        });
    }
    //#endregion Init
    //#region Controller
    async _loadControllers() {
        const ctrlPath = this._controllerPath || path.join(process.cwd(), 'dist', 'app', 'controllers');
        return await Promise.resolve().then(() => require(ctrlPath)) || {};
    }
    _initControllers(controllers, app) {
        for (const ctrlName of Object.getOwnPropertyNames(controllers)) {
            const CtrlClass = controllers[ctrlName];
            this._assertValidController(ctrlName, CtrlClass);
            const router = this._buildControllerRoutes(CtrlClass, app);
            this._buildControllerFilters(CtrlClass, router);
            this._initActions(CtrlClass, router);
        }
    }
    _buildControllerRoutes(CtrlClass, app) {
        const [ctrlPath] = this._getMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass);
        const router = express.Router({ mergeParams: true });
        app.use(`${this._urlPrefix}${ctrlPath}`, router);
        return router;
    }
    _buildControllerFilters(CtrlClass, router) {
        const metaFilters = this._getMetadata(MetaData_1.MetaData.CONTROLLER_FILTER, CtrlClass);
        this._useFilterMiddleware(metaFilters, router);
    }
    //#endregion Controller
    //#region Action
    _initActions(CtrlClass, router) {
        const allFunctions = new Map();
        // Iterates over all function backwards prototype chain, except root Object.prototype
        for (let proto = CtrlClass.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
            for (const actionName of Object.getOwnPropertyNames(proto)) {
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
        // tslint:disable-next-line:prefer-const
        for (let [, actFn] of allFunctions) {
            const proxyFn = this._proxyActionFunc(actFn, CtrlClass);
            this._buildActionRoutesAndFilters(proxyFn, actFn.name, CtrlClass, router);
        }
    }
    _proxyActionFunc(actionFunc, CtrlClass) {
        const bound = this._depContainer.bind(CtrlClass.name, CtrlClass);
        if (this._creationStrategy == ControllerCreationStrategy.SINGLETON) {
            bound.asSingleton();
        }
        // Returns a proxy function that resolves the actual action function in EVERY incomming request.
        // If Controller Creation Strategy is SINGLETON, then the same controller instance will handle all requests.
        // Otherwise, a new controller instance will be created for each request.
        return common_1.HandlerContainer.instance.register(actionFunc.name, CtrlClass.name, (ctrlInstance, actionName) => {
            if (actionName !== actionFunc.name) {
                return null;
            }
            // Wrapper function that handles uncaught errors,
            // so that controller actions don't need to call `next(error)` like said
            // by https://expressjs.com/en/guide/error-handling.html
            return function (req, res, next) {
                try {
                    actionFunc.call(this, req, res);
                }
                catch (err) {
                    next(err);
                }
            };
        });
    }
    _buildActionRoutesAndFilters(actionFunc, actionName, CtrlClass, router) {
        const actionDesc = this._getMetadata(MetaData_1.MetaData.ACTION, CtrlClass, actionName);
        const filters = this._getActionFilters(CtrlClass, actionName);
        const filterFuncs = filters.map(f => this._extractFilterExecuteFunc(f.FilterClass, f.filterParams));
        // In case one action supports multiple methods (GET, POST etc.)
        for (const method of Object.getOwnPropertyNames(actionDesc)) {
            const routerMethod = router[method];
            if (typeof routerMethod !== 'function') {
                throw new common_1.CriticalException(`Express Router doesn't support method "${method}"`);
            }
            const routePath = actionDesc[method];
            const args = [routePath, ...filterFuncs, actionFunc];
            // This is equivalent to:
            // router.METHOD(path, filter_1, filter_2, actionFunc)
            routerMethod.apply(router, args);
        }
    }
    _getActionFilters(CtrlClass, actionName) {
        const metaFilters = this._getMetadata(MetaData_1.MetaData.ACTION_FILTER, CtrlClass, actionName);
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
        // Must make a clone to avoid mutating the original filter array in Reflect metadata.
        const cloned = Array.from(filters);
        // `reverse()`: Policies with priority of greater number should run before ones with less priority.
        // Expected format:
        // filters = [
        //        1: [ FilterClass, FilterClass ],
        //        5: [ FilterClass, FilterClass ],
        // ]
        cloned.reverse().forEach(samePriorityFilters => {
            if (!samePriorityFilters || !samePriorityFilters.length) {
                return;
            }
            for (const { FilterClass, filterParams } of samePriorityFilters) { // 1: [ FilterClass, FilterClass ]
                appOrRouter.use(this._extractFilterExecuteFunc(FilterClass, filterParams));
            }
        });
    }
    _useErrorHandlerMiddleware(handlers, appOrRouter) {
        if (!handlers || !handlers.length) {
            return;
        }
        for (const HandlerClass of handlers) {
            appOrRouter.use(this._extractFilterExecuteFunc(HandlerClass, [], 4));
        }
    }
    _extractFilterExecuteFunc(FilterClass, filterParams, paramLength = 3) {
        const filter = this._instantiateClass(FilterClass, true);
        // This is the middleware function that Express will call
        const filterFunc = function ( /* request, response, next */) {
            return filter.execute.apply(filter, [...arguments, ...filterParams]);
        };
        // Express depends on number of parameters (aka Function.length)
        // to determine whether a middleware is request handler or error handler.
        // See more: https://expressjs.com/en/guide/error-handling.html
        Object.defineProperty(filterFunc, 'length', { value: paramLength });
        return filterFunc;
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
        const container = this._depContainer;
        // const container: IDependencyContainer = serviceContext.dependencyContainer
        if (!container.isBound(TargetClass.name)) {
            const bindResult = container.bind(TargetClass.name, TargetClass);
            isSingleton && bindResult.asSingleton();
        }
        return container.resolve(TargetClass.name);
    }
    _instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5) {
        if (isSingleton) {
            return TargetClass['__instance'] ?
                TargetClass['__instance'] :
                (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5));
        }
        return new TargetClass(arg1, arg2, arg3, arg4, arg5);
    }
    _getMetadata(metaKey, classOrProto, propName) {
        return (propName)
            ? Reflect.getMetadata(metaKey, classOrProto, propName)
            : Reflect.getOwnMetadata(metaKey, classOrProto);
    }
    //#endregion Filter
    //#region Validation
    _assertValidController(ctrlName, CtrlClass) {
        if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass)) {
            throw new common_1.CriticalException(`Controller "${ctrlName}" must be a class and decorated with @controller()`);
        }
    }
};
__decorate([
    common_1.lazyInject(common_1.Types.CONFIG_PROVIDER),
    __metadata("design:type", Object)
], ExpressServerAddOn.prototype, "_cfgProvider", void 0);
__decorate([
    common_1.lazyInject(common_1.Types.DEPENDENCY_CONTAINER),
    __metadata("design:type", Object)
], ExpressServerAddOn.prototype, "_depContainer", void 0);
ExpressServerAddOn = __decorate([
    common_1.injectable(),
    __metadata("design:paramtypes", [])
], ExpressServerAddOn);
exports.ExpressServerAddOn = ExpressServerAddOn;
//# sourceMappingURL=ExpressServerAddOn.js.map