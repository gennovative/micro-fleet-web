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
var _a;
"use strict";
const TrailsApp = require("trails");
const common_1 = require("@micro-fleet/common");
const filter_1 = require("./decorators/filter");
const TenantResolverFilter_1 = require("./filters/TenantResolverFilter");
const ErrorHandlerFilter_1 = require("./filters/ErrorHandlerFilter");
// import { AuthFilter } from './filters/AuthFilter';
const WebContext_1 = require("./WebContext");
const MetaData_1 = require("./constants/MetaData");
const Types_1 = require("./Types");
const INVERSIFY_INJECTABLE = 'inversify:paramtypes';
let TrailsServerAddOn = class TrailsServerAddOn {
    constructor(depContainer, _trailsOpts) {
        this._trailsOpts = _trailsOpts;
        WebContext_1.webContext.setDependencyContainer(depContainer);
        this._onError = (...args) => { };
        this._globalFilters = [];
    }
    get server() {
        return this._server;
    }
    /**
     * @see IServiceAddOn.init
     */
    init() {
        common_1.Guard.assertIsDefined(this.pathPrefix, '`TrailsServerAddOn.pathPrefix` must be set!');
        WebContext_1.webContext.setUrlPrefix(this.pathPrefix);
        this.addErrorHandlerFilter();
        this.buildConfig();
        let server = this._server = new TrailsApp(this._trailsOpts);
        server.on('error', this._onError);
        WebContext_1.webContext.dependencyContainer.bindConstant(Types_1.Types.TRAILS_APP, server);
        return server.start()
            .catch(err => server.stop(err));
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
    addErrorHandlerFilter() {
        this.addGlobalFilter(ErrorHandlerFilter_1.ErrorHandlerFilter, 9);
    }
    addTenantResolverFilter() {
        this.addGlobalFilter(TenantResolverFilter_1.TenantResolverFilter, 9);
    }
    /**
     * Registers a global-scoped filter which is called on every coming request.
     * @param FilterClass
     * @param filterFunc
     * @param priority
     */
    addGlobalFilter(FilterClass, priority) {
        filter_1.pushFilterToArray(this._globalFilters, FilterClass, priority);
    }
    buildConfig() {
        let config = this._trailsOpts.config, routes = config.routes || [], ctrlFilters;
        this.buildGlobalScopeFilters();
        for (let ctrlName of Object.getOwnPropertyNames(this._trailsOpts.controllers)) {
            let CtrlClass = this._trailsOpts.controllers[ctrlName];
            if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass)) {
                continue;
            }
            // Clone array to make sure global filters are executed before controller ones.
            ctrlFilters = this._globalFilters.slice();
            this.buildControllerConfigs(CtrlClass, routes, ctrlFilters);
        }
        config.routes = routes;
    }
    buildControllerConfigs(CtrlClass, routes, ctrlFilters) {
        let [path] = this.popMetadata(MetaData_1.MetaData.CONTROLLER, CtrlClass), isGetSetter = (proto, funcName) => {
            let desc = Object.getOwnPropertyDescriptor(proto, funcName);
            return (desc && (desc.get || desc.set));
        };
        this.buildControllerScopeFilters(CtrlClass, ctrlFilters);
        let allFunctions = new Map(), actionFunc;
        // Iterates over all function in prototype chain, except root Object.prototype
        for (let proto = CtrlClass.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
            for (let actionName of Object.getOwnPropertyNames(proto)) {
                if (actionName == 'constructor' || isGetSetter(proto, actionName)) {
                    continue;
                }
                actionFunc = proto[actionName];
                if (typeof actionFunc !== 'function' ||
                    allFunctions.has(actionName) || // Make sure function in super class never overides function in derives class.
                    !Reflect.hasMetadata(MetaData_1.MetaData.ACTION, CtrlClass, actionName)) { // Only register route for function with @action annotation.
                    continue;
                }
                // Let actions in derived class override actions in super class.
                allFunctions.set(actionName, actionFunc);
            }
        }
        // Destructuring to get second element
        for ([, actionFunc] of allFunctions) {
            routes.push(this.buildActionRoute(CtrlClass, actionFunc, path));
            this.buildActionFilters(CtrlClass, ctrlFilters, actionFunc);
        }
    }
    buildActionRoute(CtrlClass, actionFunc, controllerPath) {
        let [method, path] = this.popMetadata(MetaData_1.MetaData.ACTION, CtrlClass, actionFunc.name), routePath = `${WebContext_1.webContext.urlPrefix}${controllerPath}${path}`, thisAddon = this;
        return {
            method,
            path: routePath,
            // handler: `${CtrlClass.name}.${actionFunc.name}`
            // handler: HandlerContainer.instance.register(actionFunc.name, controllerIdentifier)
            // Creates new controller for each request.
            handler: function ( /*req, res, next*/) {
                // Only keep "req" and "res" in arguments list.
                let args = Array.prototype.slice.call(arguments, 0, 2), ctrl = thisAddon.instantiateClass(CtrlClass, false, thisAddon._server);
                thisAddon.executeFilters(CtrlClass, ctrl, actionFunc, args);
            }
        };
    }
    buildGlobalScopeFilters() {
        let filters = [];
        // `globalFilters` is a 2-dimensioned matrix:
        // globalFilters = [
        //		1: [ FilterClass, FilterClass ]
        //		5: [ FilterClass, FilterClass ]
        // ]
        this._globalFilters.reverse().forEach(priorityList => {
            priorityList.forEach(FilterClass => {
                filters.push(this.bindFuncWithFilterInstance(FilterClass));
            });
        });
        this._globalFilters = filters;
    }
    buildControllerScopeFilters(CtrlClass, ctrlFilters) {
        let metaFilters = this.popMetadata(MetaData_1.MetaData.CONTROLLER_FILTER, CtrlClass);
        if (!metaFilters || !metaFilters.length) {
            return;
        }
        // `reverse()`: Policies with priority of greater number should run before ones with less priority.
        // filters = [
        //		5: [ FilterClass, FilterClass ]
        //		1: [ FilterClass, FilterClass ]
        // ]
        metaFilters.reverse().forEach(priorityFilters => {
            for (let FilterClass of priorityFilters) { // 1: [ FilterClass, FilterClass ]
                if ((typeof FilterClass) == 'function') {
                    ctrlFilters.push(FilterClass);
                    continue;
                }
                ctrlFilters.push(this.bindFuncWithFilterInstance(FilterClass));
            }
        });
    }
    bindFuncWithFilterInstance(FilterClass) {
        let filter = this.instantiateClass(FilterClass, true);
        return filter.execute.bind(filter);
    }
    instantiateClass(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5) {
        // Create an instance either from dependency container or with normay way.
        // Make sure this instance is singleton.
        if (!Reflect.hasOwnMetadata(INVERSIFY_INJECTABLE, TargetClass)) {
            return this.instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5);
        }
        let instance = this.instantiateClassFromContainer(TargetClass, isSingleton);
        common_1.Guard.assertIsDefined(instance, `Class "${TargetClass.name}" is decorated with @injectable, but cannot be resolved. 
			Make sure its class name is bound as dependency identifier, or its constructor arguments are resolved successfully.`);
        return instance;
    }
    instantiateClassFromContainer(TargetClass, isSingleton) {
        let container = WebContext_1.webContext.dependencyContainer;
        if (!container.isBound(TargetClass.name)) {
            let bindResult = container.bind(TargetClass.name, TargetClass);
            isSingleton && bindResult.asSingleton();
        }
        return container.resolve(TargetClass.name);
    }
    instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5) {
        if (isSingleton) {
            return TargetClass['__instance'] ? TargetClass['__instance'] : (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5));
        }
        return new TargetClass(arg1, arg2, arg3, arg4, arg5);
    }
    buildActionFilters(CtrlClass, ctrlFilters, actionFunc) {
        let funcName = actionFunc.name, metaFilters = this.popMetadata(MetaData_1.MetaData.ACTION_FILTER, CtrlClass, funcName);
        let ctrlName = CtrlClass.name, 
        // Clone array. Controller filters will be executed before action's own filters.
        actFilters = ctrlFilters.slice();
        if (metaFilters) {
            // `reverse()`: Policies with priority of greater number should run before ones with less priority.
            // metaFilters.reverse().forEach(p => {
            // 	//actPolicies.push(`${p[0]}.${p[1]}`); // Expect: "PolicyClassName.functionName"
            // 	let FilterClass = p;
            // 	actFilters.push(
            // 			this.bindFuncWithFilterInstance(FilterClass, funcName)
            // 		);
            // });
            metaFilters.reverse().forEach(priorityFilters => {
                for (let FilterClass of priorityFilters) { // 1: [ FilterClass, FilterClass ]
                    if ((typeof FilterClass) == 'function') {
                        actFilters.push(FilterClass);
                        continue;
                    }
                    actFilters.push(this.bindFuncWithFilterInstance(FilterClass));
                }
            });
        }
        // Save these filters and will execute them whenever
        // a request is routed to this action.
        Reflect.defineMetadata(MetaData_1.MetaData.ACTION_FILTER, actFilters, CtrlClass, funcName);
    }
    popMetadata(metaKey, classOrProto, propName) {
        let metadata = (propName)
            ? Reflect.getMetadata(metaKey, classOrProto, propName)
            : Reflect.getOwnMetadata(metaKey, classOrProto);
        Reflect.deleteMetadata(metaKey, classOrProto, propName);
        return metadata;
    }
    executeFilters(CtrlClass, ctrlInstance, actionFunc, requestArgs) {
        let filters = Reflect.getMetadata(MetaData_1.MetaData.ACTION_FILTER, CtrlClass, actionFunc.name), nextChain = [];
        // At the end of the chain, execute the target action.
        nextChain[filters.length - 1] = function () { actionFunc.apply(ctrlInstance, requestArgs); };
        // Inside filter[i] function, when it calls "next()",
        // the filter[i+1] will be executed, and so forth...
        for (let i = filters.length - 2; i >= 0; i--) {
            nextChain[i] = function () {
                filters[i + 1].apply(null, [...requestArgs, nextChain[i + 1]]);
            };
        }
        // Now, invoke the first filter in chain.
        filters[0].apply(null, [...requestArgs, nextChain[0]]);
    }
};
TrailsServerAddOn = __decorate([
    common_1.injectable(),
    __param(0, common_1.inject(common_1.Types.DEPENDENCY_CONTAINER)),
    __param(1, common_1.inject(Types_1.Types.TRAILS_OPTS)),
    __metadata("design:paramtypes", [Object, typeof (_a = (typeof TrailsApp !== "undefined" && TrailsApp).TrailsAppOts) === "function" && _a || Object])
], TrailsServerAddOn);
exports.TrailsServerAddOn = TrailsServerAddOn;
//# sourceMappingURL=TrailsServerAddOn.js.map