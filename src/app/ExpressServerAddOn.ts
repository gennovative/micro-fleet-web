import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as https from 'https'

import * as express from 'express'
import * as cors from 'cors'
import { injectable, lazyInject, CriticalException, IDependencyContainer, Guard,
    Maybe, IConfigurationProvider, Types as T, constants, HandlerContainer } from '@micro-fleet/common'
const { WebSettingKeys: W } = constants

import { MetaData } from './constants/MetaData'
import { ActionDescriptor } from './decorators/action'
import { IActionErrorHandler, ActionInterceptor, PrioritizedFilterArray,
    FilterArray, FilterPriority, pushFilterToArray } from './decorators/filter'
import { webContext } from './WebContext'


const INVERSIFY_INJECTABLE = 'inversify:paramtypes'
const DEFAULT_PORT = 80
const DEFAULT_URL_PREFIX = ''
const DEFAULT_SSL_PORT = 443

type ControllerExports = { [name: string]: Newable }

export enum ControllerCreationStrategy { SINGLETON, TRANSIENT }

@injectable()
export class ExpressServerAddOn implements IServiceAddOn {

    /**
     * Gets this add-on's name.
     */
    public readonly name: string = 'ExpressServerAddOn'

    /**
     * Gets or sets strategy when creating controller instance.
     */
    public controllerCreation: ControllerCreationStrategy

    /**
     * Gets or sets path to folder containing controller classes.
     */
    public controllerPath: string

    protected _server: http.Server
    protected _express: express.Express
    protected _port: number
    protected _urlPrefix: string

    protected _globalFilters: PrioritizedFilterArray
    protected _globalErrorHandlers: Newable[]
    protected _isAlive: boolean

    protected _sslEnabled: boolean
    protected _sslPort: number
    protected _sslKey: string
    protected _sslKeyFile: string
    protected _sslCert: string
    protected _sslCertFile: string
    protected _sslOnly: boolean
    protected _sslServer: http.Server


    @lazyInject(T.CONFIG_PROVIDER)
    protected _cfgProvider: IConfigurationProvider

    @lazyInject(T.DEPENDENCY_CONTAINER)
    protected _depContainer: IDependencyContainer


    //#region Getters / Setters

    /**
     * Gets express instance.
     */
    public get express(): express.Express {
        return this._express
    }

    /**
     * Gets HTTP port number.
     */
    public get port(): number {
        return this._port
    }

    /**
     * Gets URL prefix.
     */
    public get urlPrefix(): string {
        return this._urlPrefix
    }

    //#endregion Getters / Setters


    constructor() {
        this._globalFilters = []
        this._globalErrorHandlers = []
        this._isAlive = false
        this._urlPrefix = ''
        this._port = 0
        this._express = express()
        this.controllerCreation = ControllerCreationStrategy.TRANSIENT
    }


    //#region General public methods

    /**
     * Registers a global-scoped filter which is called on every coming request.
     * @param FilterClass The filter class.
     * @param {FilterPriority} priority Filters with greater priority run before ones with less priority.
     */
    public addGlobalFilter<TFilter extends ActionInterceptor>(FilterClass: Newable<TFilter>, priority?: FilterPriority): void {
        pushFilterToArray(this._globalFilters, FilterClass, priority)
    }

    /**
     * Registers a global-scoped error handler which catches error from filters and actions.
     * @param HandlerClass The error handler class.
     */
    public addGlobalErrorHandler<THandler extends IActionErrorHandler>(HandlerClass: Newable<THandler>): void {
        this._globalErrorHandlers.push(HandlerClass)
    }

    /**
     * @memberOf IServiceAddOn
     */
    public deadLetter(): Promise<void> {
        this._isAlive = false
        return Promise.resolve()
    }

    /**
     * @memberOf IServiceAddOn
     */
    public dispose(): Promise<void> {
        return <any>Promise.resolve().then(() => {
            this._server.close()
            this._server = null
        })
    }

    //#endregion General public methods


    //#region Init

    /**
     * @memberOf IServiceAddOn
     */
    public init(): Promise<void> {
        this.loadConfig()
        webContext.setUrlPrefix(this._urlPrefix)

        return <any>Promise.all([
            // Loading controllers from file takes time,
            // so we call createServer in parallel.
            this._loadControllers(),
            this._setupExpress(),
        ]).then(([controllers, app]: [ControllerExports, express.Express]) => {
            this._initControllers(controllers, app)
            this._useErrorHandlerMiddleware(this._globalErrorHandlers, app)
            return this._startServers(app)
        })
    }

    protected loadConfig(): void {
        this._port = this.getCfg<number>(W.WEB_PORT, DEFAULT_PORT)
        this._urlPrefix = this.getCfg<string>(W.WEB_URL_PREFIX, DEFAULT_URL_PREFIX)
        this._sslEnabled = this.getCfg<boolean>(W.WEB_SSL_ENABLED, false)
        if (!this._sslEnabled) {
            return
        }
        this._sslPort = this.getCfg<number>(W.WEB_SSL_PORT, DEFAULT_SSL_PORT)
        this._sslOnly = this.getCfg<boolean>(W.WEB_SSL_ONLY, false)
        this._sslCertFile = this.getCfg<string>(W.WEB_SSL_CERT_FILE, '')
        this._sslKeyFile = this.getCfg<string>(W.WEB_SSL_KEY_FILE, '')
    }

    protected getCfg<TVal extends PrimitiveType>(name: string, defaultValue: any): TVal {
        return this._cfgProvider.get(name).TryGetValue(defaultValue) as TVal
    }

    protected _setupExpress(): express.Express {
        const app = this._express

        app.disable('x-powered-by')
        // When `deadLetter()` is called, prevent all new requests.
        app.use((req, res, next) => {
            if (!this._isAlive) {
                return res.sendStatus(410) // Gone, https://httpstatuses.com/410
            }
            return next()
        })

        // Binds global filters as application-level middlewares to specified Express instance.
        // Binds filters with priority HIGH
        this._useFilterMiddleware(this._globalFilters.filter((f, i) => i == FilterPriority.HIGH), app)

        const corsOptions: cors.CorsOptions = {
            origin: this._cfgProvider.get(W.WEB_CORS).TryGetValue(false) as string | boolean,
            optionsSuccessStatus: 200,
        }
        app.use(cors(corsOptions))
        app.use(express.urlencoded({extended: true})) // Parse Form values in POST requests
        app.use(express.json()) // Parse requests with JSON payloads

        // Binds filters with priority from MEDIUM to LOW
        // All 3rd party middlewares have priority MEDIUM.
        this._useFilterMiddleware(this._globalFilters.filter((f, i) => i == FilterPriority.MEDIUM || i == FilterPriority.LOW), app)

        return app
    }

    protected _startServers(app: express.Express): Promise<any> {
        return Promise.all([
            this._startHttp(app),
            this._startSsl(app),
        ])
    }

    protected _startHttp(app: express.Express): Promise<any> {

        return new Promise((resolve, reject) => {
            let server: http.Server
            if (this._sslEnabled && this._sslOnly) {
                server = http.createServer((req, res) => {
                    // Redirect the request to HTTPS
                    res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`})
                    res.end()
                })
            } else {
                server = http.createServer(app)
            }

            this._server = server
                .on('listening', () => {
                    this._isAlive = true
                    console.log('HTTP listening on: ', this._port)
                    resolve()
                })
                .on('error', reject)
                .listen(this._port)
        })
    }

    protected _startSsl(app: express.Express): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this._sslEnabled) {
                return resolve()
            }

            const [key, cert] = this._readKeyPairs()
            const sslOptions = { key, cert }
            this._sslServer = https.createServer(sslOptions, app)
                .on('listening', () => {
                    this._isAlive = true
                    console.log('HTTPS listening on: ', this._sslPort)
                    resolve()
                })
                .on('error', reject)
                .listen(this._sslPort)
        })
    }

    protected _readKeyPairs(): [string, string] {
        return [
            this._sslKey || fs.readFileSync(this._sslKeyFile, 'utf8'),
            this._sslCert || fs.readFileSync(this._sslCertFile, 'utf8'),
        ]
    }

    //#endregion Init


    //#region Controller

    protected async _loadControllers(): Promise<ControllerExports> {
        const ctrlPath = this.controllerPath || path.join(process.cwd(), 'dist', 'app', 'controllers')
        return await import(ctrlPath) || {}
    }

    protected _initControllers(controllers: ControllerExports, app: express.Express): void {
        for (const ctrlName of Object.getOwnPropertyNames(controllers)) {
            const CtrlClass = controllers[ctrlName]
            this._assertValidController(ctrlName, CtrlClass)
            const router = this._buildControllerRoutes(CtrlClass, app)
            this._buildControllerFilters(CtrlClass, router)
            this._initActions(CtrlClass, router)
        }
    }

    protected _buildControllerRoutes(CtrlClass: Newable, app: express.Express): express.Router {
        const [ctrlPath]: [string] = this._getMetadata(MetaData.CONTROLLER, CtrlClass)
        const router = express.Router({ mergeParams: true })
        app.use(`${this._urlPrefix}${ctrlPath}`, router)
        return router
    }

    protected _buildControllerFilters(CtrlClass: Function, router: express.Router): void {
        const metaFilters: PrioritizedFilterArray = this._getMetadata(MetaData.CONTROLLER_FILTER, CtrlClass)
        this._useFilterMiddleware(metaFilters, router)
    }

    //#endregion Controller


    //#region Action

    protected _initActions(CtrlClass: Newable, router: express.Router): void {
        const allFunctions = new Map<string, Function>()
        // Iterates over all function backwards prototype chain, except root Object.prototype
        for (let proto = CtrlClass.prototype; proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
            for (const actionName of Object.getOwnPropertyNames(proto)) {
                // Make sure function in super class never overides function in derives class.
                if (allFunctions.has(actionName)) { continue }

                const actionFunc = this._extractActionFromPrototype(proto, actionName)
                if (!actionFunc.hasValue) { continue }

                allFunctions.set(actionName, actionFunc.value)
            }
        }
        // Destructuring to get second element (expected: [key, value])
        // tslint:disable-next-line:prefer-const
        for (let [, actFn] of allFunctions) {
            const proxyFn = this._proxyActionFunc(actFn, CtrlClass)
            this._buildActionRoutesAndFilters(proxyFn, actFn.name, CtrlClass, router)
        }
    }

    protected _proxyActionFunc(actionFunc: Function, CtrlClass: Newable): Function {
        const bound = this._depContainer.bind(CtrlClass.name, CtrlClass)
        if (this.controllerCreation == ControllerCreationStrategy.SINGLETON) {
            bound.asSingleton()
        }

        // Returns a proxy function that resolves the actual action function in EVERY incomming request.
        // If Controller Creation Strategy is SINGLETON, then the same controller instance will handle all requests.
        // Otherwise, a new controller instance will be created for each request.
        return HandlerContainer.instance.register(actionFunc.name, CtrlClass.name,
            (ctrlInstance, actionName) => {
                if (actionName !== actionFunc.name) { return null }

                // Wrapper function that handles uncaught errors,
                // so that controller actions don't need to call `next(error)` like said
                // by https://expressjs.com/en/guide/error-handling.html
                return function (this: any, req: express.Request, res: express.Response, next: express.NextFunction) {
                    try {
                        actionFunc.call(this, req, res)
                    } catch (err) {
                        next(err)
                    }
                }
            }) as Function
    }

    protected _buildActionRoutesAndFilters(actionFunc: Function, actionName: string, CtrlClass: Newable, router: express.Router): void {
        const actionDesc: ActionDescriptor = this._getMetadata(MetaData.ACTION, CtrlClass, actionName)
        const filters = this._getActionFilters(CtrlClass, actionName)
        const filterFuncs = filters.map(f => this._extractFilterExecuteFunc(f.FilterClass, f.filterParams))

        // In case one action supports multiple methods (GET, POST etc.)
        for (const method of Object.getOwnPropertyNames(actionDesc)) {
            const routerMethod: Function = router[method]
            if (typeof routerMethod !== 'function') {
                throw new CriticalException(`Express Router doesn't support method "${method}"`)
            }
            const routePath = actionDesc[method]
            const args: any[] = [routePath, ...filterFuncs, actionFunc]
            // This is equivalent to:
            // router.METHOD(path, filter_1, filter_2, actionFunc)
            routerMethod.apply(router, args)
        }
    }

    protected _getActionFilters(CtrlClass: Function, actionName: string): FilterArray {
        const metaFilters: PrioritizedFilterArray = this._getMetadata(MetaData.ACTION_FILTER, CtrlClass, actionName)
        if (!metaFilters || !metaFilters.length) { return [] }

        // Flatten PrioritizedFilterArray structure
        const filters: FilterArray = metaFilters.reduceRight((prev: FilterArray, samePriorityFilters: FilterArray) => {
            return prev.concat(samePriorityFilters)
        }, [])

        return filters
    }

    protected _extractActionFromPrototype(prototype: any, name: string): Maybe<Function> {
        if (!prototype || !name) { return new Maybe }

        const isGetSetter = (proto: any, funcName: string) => {
            const desc = Object.getOwnPropertyDescriptor(proto, funcName)
            return (desc && (desc.get || desc.set))
        }
        const func = prototype[name]
        const isPureFunction = (name !== 'constructor') && (typeof func === 'function') && !isGetSetter(prototype, name)
        const isDecorated = Reflect.hasMetadata(MetaData.ACTION, prototype.constructor, name)
        return isPureFunction && isDecorated ? new Maybe(func) : new Maybe
    }


    //#endregion Action


    //#region Filter

    protected _useFilterMiddleware(filters: PrioritizedFilterArray, appOrRouter: express.Express | express.Router): void {
        if (!filters || !filters.length) { return }

        // Must make a clone to avoid mutating the original filter array in Reflect metadata.
        const cloned = Array.from(filters)

        // `reverse()`: Policies with priority of greater number should run before ones with less priority.
        // Expected format:
        // filters = [
        //        1: [ FilterClass, FilterClass ],
        //        5: [ FilterClass, FilterClass ],
        // ]
        cloned.reverse().forEach(samePriorityFilters => {
            if (!samePriorityFilters || !samePriorityFilters.length) {
                return
            }
            for (const { FilterClass, filterParams } of samePriorityFilters) { // 1: [ FilterClass, FilterClass ]
                appOrRouter.use(this._extractFilterExecuteFunc(FilterClass, filterParams) as express.RequestHandler)
            }
        })
    }

    protected _useErrorHandlerMiddleware(handlers: Newable[], appOrRouter: express.Express | express.Router): void {
        if (!handlers || !handlers.length) { return }

        for (const HandlerClass of handlers) {
            appOrRouter.use(this._extractFilterExecuteFunc(HandlerClass, [], 4) as express.RequestHandler)
        }
    }

    protected _extractFilterExecuteFunc<TFilter extends ActionInterceptor>(FilterClass: Newable<TFilter>, filterParams: any[],
            paramLength: number = 3): Function {
        const filter: ActionInterceptor = this._instantiateClass(FilterClass, true)
        // This is the middleware function that Express will call
        const filterFunc = function (/* request, response, next */) {
            return filter.execute.apply(filter, [...arguments, ...filterParams] as any)
        }

        // Express depends on number of parameters (aka Function.length)
        // to determine whether a middleware is request handler or error handler.
        // See more: https://expressjs.com/en/guide/error-handling.html
        Object.defineProperty(filterFunc, 'length', { value: paramLength })
        return filterFunc
    }

    protected _instantiateClass<TTarget extends ActionInterceptor>(TargetClass: Newable<TTarget>, isSingleton: boolean,
            arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): ActionInterceptor {
        // Create an instance either from dependency container or with normay way.
        // Make sure this instance is singleton.
        if (!Reflect.hasOwnMetadata(INVERSIFY_INJECTABLE, TargetClass)) {
            return this._instantiateClassTraditionally(TargetClass, isSingleton, arg1, arg2, arg3, arg4, arg5)
        }
        const instance = this._instantiateClassFromContainer(TargetClass, isSingleton)
        Guard.assertIsDefined(instance,
            `Class "${TargetClass.name}" is decorated with @injectable, but cannot be resolved.
            Make sure its class name is bound as dependency identifier, or its constructor arguments are resolved successfully.`)
        return instance
    }

    protected _instantiateClassFromContainer(TargetClass: Newable, isSingleton: boolean): any {
        const container: IDependencyContainer = this._depContainer
        // const container: IDependencyContainer = serviceContext.dependencyContainer
        if (!container.isBound(TargetClass.name)) {
            const bindResult = container.bind(TargetClass.name, TargetClass)
            isSingleton && bindResult.asSingleton()
        }
        return container.resolve(TargetClass.name)
    }

    protected _instantiateClassTraditionally(TargetClass: Newable, isSingleton: boolean,
            arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any {
        if (isSingleton) {
            return TargetClass['__instance'] ?
                TargetClass['__instance'] :
                (TargetClass['__instance'] = new TargetClass(arg1, arg2, arg3, arg4, arg5))
        }
        return new TargetClass(arg1, arg2, arg3, arg4, arg5)
    }

    protected _getMetadata(metaKey: string, classOrProto: any, propName?: string): any {
        return (propName)
            ? Reflect.getMetadata(metaKey, classOrProto, propName)
            : Reflect.getOwnMetadata(metaKey, classOrProto)
    }

    //#endregion Filter


    //#region Validation

    protected _assertValidController(ctrlName: string, CtrlClass: Newable): void {
        if (typeof CtrlClass !== 'function' || !Reflect.hasOwnMetadata(MetaData.CONTROLLER, CtrlClass)) {
            throw new CriticalException(`Controller "${ctrlName}" must be a class and decorated with @controller()`)
        }
    }

    //#endregion Validation

}
