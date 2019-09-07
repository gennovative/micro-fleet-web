import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { StatusCodeError } from 'request-promise-native/errors'
import { DependencyContainer, serviceContext, decorators as d,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, ErrorHandlerFilter,
    Types as T } from '../../app'


const PORT = 31000
const CONTROLLER_NAME = 'RespondingController'
const BASE_URL = `http://localhost:${PORT}`
const { Web: W } = constants


@d.injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'
    public configFilePath: string

    public enableRemote: boolean = false
    public enableCors: boolean = false

    public get(key: string): Maybe<any> {
        switch (key) {
            case W.WEB_PORT:
                return Maybe.Just(PORT)
        }
        return Maybe.Nothing()
    }

    public init = () => Promise.resolve()
    public deadLetter = () => Promise.resolve()
    public dispose = () => Promise.resolve()
    public onUpdate = (listener: (changedKeys: string[]) => void) => { /* Empty */ }
    public fetch = () => Promise.resolve(true)

}


describe('@response()', function() {
    // this.timeout(5000)
    this.timeout(60000) // For debugging

    let server: ExpressServerAddOn
    let container: DependencyContainer

    let error: any
    const unexpectFn = (res: any) => {
        // Unexpectedly Assert
        error = new Error('Should never come here!')
        expect(false, 'Should never come here!').to.be.true
        console.error(res)
    }



    beforeEach(() => {
        container = new DependencyContainer
        serviceContext.setDependencyContainer(container)
        container.bindConstant(CmT.DEPENDENCY_CONTAINER, container)
        container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton()
        container.bind(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton()

        server = container.resolve(T.WEBSERVER_ADDON)
        server.controllerCreation = ControllerCreationStrategy.SINGLETON
        server.controllerPath = path.join(process.cwd(), 'dist',
            'test', 'shared', 'responding-controller')
        server.addGlobalErrorHandler(ErrorHandlerFilter)
    })

    afterEach(async () => {
        container.dispose()
        await server.dispose()
        container = server = null
        serviceContext.setDependencyContainer(null)
    })

    describe('Auto', function() {
        it('Should respond with sync value if @response is not present', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/auto-sync`)
                })
                .then((res) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(res).to.equal('RespondingController.getAutoSync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with async value if @response is not present', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/auto-async`, {
                        method: 'PUT',
                        json: true,
                    })
                })
                .then((res: any) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(res.info).to.equal('RespondingController.getAutoAsync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with sync error if @response is not present', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/auto-sync-error`, {
                        method: 'PATCH',
                    })
                })
                .then(unexpectFn)
                .catch((err: StatusCodeError) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(err.statusCode).to.equal(500)
                    // In production mode: expect(err.error).to.equal('')
                    // In debug mode: expect(err.error).to.equal('1234567890')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with async error if @response is not present', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/auto-async-error`, {
                        method: 'POST',
                        json: true,
                    })
                })
                .then(unexpectFn)
                .catch((err: StatusCodeError) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(err.statusCode).to.equal(500)
                    // In production mode: expect(err.error).to.equal('')
                    // In debug mode: expect(err.error.reason).to.equal('RespondingController.getAutoFailAsync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })
    })

    describe('Manual', function() {
        it('Should respond with sync value with injected @response', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/manual-sync`)
                })
                .then((res) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(res).to.equal('RespondingController.getManualSync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with async value with injected @response', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/manual-async`, {
                        method: 'PUT',
                        json: true,
                    })
                })
                .then(function (res: any) {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    // expect(err.statusCode).to.equal(500)
                    expect(res.info).to.equal('RespondingController.getManualAsync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with sync error with injected @response', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/manual-sync-error`, {
                        method: 'PATCH',
                    })
                })
                .then(unexpectFn)
                .catch((err: StatusCodeError) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(err.statusCode).to.equal(500)
                    expect(err.error).to.equal('1234567890')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })

        it('Should respond with async error with injected @response', (done: Function) => {
            // Arrange
            error = null
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/respond/manual-async-error`, {
                        method: 'POST',
                        json: true,
                    })
                })
                .then(unexpectFn)
                .catch((err: StatusCodeError) => {
                    // Assert
                    const controller: any = container.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(err.statusCode).to.equal(502)
                    expect(err.error.reason).to.equal('RespondingController.getManualFailAsync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })
    })


}) // describe '@response()'
