import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { StatusCodeError } from 'request-promise-native/errors'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, ErrorHandlerFilter,
    createExpressMockServer} from '../../app'


const PORT = 31000
const CONTROLLER_NAME = 'RespondingController'
const CONTROLLER_FILE = 'responding-controller'
const BASE_URL = `http://localhost:${PORT}`
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@response()', function() {
    // this.timeout(5000)
    this.timeout(60000) // For debugging

    let server: ExpressServerAddOn
    let depContainer: DependencyContainer

    let error: any
    const unexpectFn = (res: any) => {
        // Unexpectedly Assert
        error = new Error('Should never come here!')
        expect(false, 'Should never come here!').to.be.true
        console.error(res)
    }

    function createServer(configs: object = {}): ExpressServerAddOn {
        ({ server, depContainer } = createExpressMockServer({ configs }))
        serviceContext.setDependencyContainer(depContainer)
        server.controllerCreation = ControllerCreationStrategy.SINGLETON
        server.controllerPath = path.join(process.cwd(), 'dist',
            'test', 'shared', CONTROLLER_FILE)
        return server
    }

    beforeEach(() => {
        server = createServer({
            [W.WEB_PORT]: PORT,
        })
        server.addGlobalErrorHandler(ErrorHandlerFilter)
    })

    afterEach(async () => {
        depContainer.dispose()
        await server.dispose()
        depContainer = server = null
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(err.statusCode).to.equal(502)
                    expect(err.error.reason).to.equal('RespondingController.getManualFailAsync')
                })
                .catch(unexpectFn)
                .finally(() => done(error))
        })
    })


}) // describe '@response()'
