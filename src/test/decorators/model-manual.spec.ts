import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, ErrorHandlerFilter,
    createExpressMockServer} from '../../app'
import { SampleModel } from '../shared/SampleModel'

// For typing only
import { StatusCodeError } from 'request-promise-native/errors'


const PORT = 31000
const CONTROLLER_NAME = 'ModelManualController'
const CONTROLLER_FILE = 'model-manual-controller'
const BASE_URL = `http://localhost:${PORT}/model-manual`
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@model() - manual', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    let server: ExpressServerAddOn
    let depContainer: DependencyContainer

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
    })

    afterEach(async () => {
        depContainer.dispose()
        await server.dispose()
        depContainer = server = null
        serviceContext.setDependencyContainer(null)
    })

    describe('translation', () => {

        it('Should resolve as first param', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/first`, {
                        method: 'POST',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    // Unexpectedly Assert
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly('SampleModel', payload.name, payload.age, payload.position)
                })
                .catch((err: any) => {
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should convert whole request.body to model class', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/valid`, {
                        method: 'POST',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly('SampleModel', payload.name, payload.age, payload.position)
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should extract raw model with custom function then converting to model class', (done: Function) => {
            // Arrange
            const payload = {
                one: <SampleModel> {
                    name: 'Valid name',
                    age: 20,
                    position: 'Coolie manager',
                },
                two: <SampleModel> {
                    name: 'Another Valid name',
                    age: 30,
                    position: 'Real coolie here',
                },
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/custom`, {
                        method: 'PATCH',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(
                        'SampleModel', payload.one.name, payload.one.age, payload.one.position,
                        'SampleModel', payload.two.name, payload.two.age, payload.two.position,
                    )
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should convert just some properties of the model class', (done: Function) => {
            // Arrange
            const payload = <Partial<SampleModel>> {
                age: 20,
                position: 'Valid position',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/partial`, {
                        method: 'PUT',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(
                        'SampleModel',
                        undefined,
                        payload.age,
                        payload.position,
                    )
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error('Unexpected Error')
                    console.dir(error = err, { depth: 5 })
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })
    }) // describe 'translating'

    describe('validation', () => {
        it('Should respond with 422 status code if there is validation error.', (done: Function) => {
            // Arrange
            process.env['DEBUG'] = 'true'
            const payload = <SampleModel> {
                name: '',
                age: 18,
            }
            let error: any
            server.addGlobalErrorHandler(ErrorHandlerFilter)
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/invalid`, {
                        method: 'POST',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).have.been.called.below(1)
                })
                .catch((err: any) => {
                    // Assert
                    if (err instanceof StatusCodeError) {
                        (err.statusCode !== 422) && console.error(err)
                        expect(err.statusCode).to.equal(422) // error: UNPROCESSABLE ENTITY
                    } else {
                        expect(false, 'Should never throw this kind of error!').to.be.true
                    }
                })
                .catch(err => error = err)
                .finally(() => {
                    error && console.dir(error, { depth: 5 })
                    delete process.env['DEBUG']
                    done(error)
                })
        })
    }) // describe 'translating'

}) // describe '@model() - manual'
