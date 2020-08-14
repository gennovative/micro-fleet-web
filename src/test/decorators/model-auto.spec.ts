import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy,
    ErrorHandlerFilter, Types as T, createExpressMockServer } from '../../app'
import { SampleModel } from '../shared/SampleModel'


const PORT = 31000
const CONTROLLER_NAME = 'ModelAutoController'
const CONTROLLER_FILE = 'model-auto-controller'
const BASE_URL = `http://localhost:${PORT}/model-auto`
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@model() - auto', function() {
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
        server.addGlobalErrorHandler(ErrorHandlerFilter)
    })

    afterEach(async () => {
        depContainer.dispose()
        await server.dispose()
        depContainer = server = null
        serviceContext.setDependencyContainer(null)
    })

    describe('translation', () => {

        it('Should infer type of single model', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/single`, {
                        method: 'POST',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    // Expected Assert
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

        it('Should resolve a model with given type then wrap in array', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/array-one-item`, {
                        method: 'PUT',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(1, 'SampleModel', payload.name, payload.age, payload.position)
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should infer an array of models with given type', (done: Function) => {
            // Arrange
            const payload = [
                <SampleModel> {
                    name: 'One',
                    age: 100,
                },
                <SampleModel> {
                    name: 'Two',
                    age: 200,
                },
                <SampleModel> {
                    name: 'Three',
                    age: 300,
                },
            ]
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/array-many-item`, {
                        method: 'PUT',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(payload.length,
                        'SampleModel', payload[0].name, payload[0].age,
                        'SampleModel', payload[1].name, payload[1].age,
                        'SampleModel', payload[2].name, payload[2].age,
                    )
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
            const payloadQuery = {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            const queryParam: string = Object.entries(payloadQuery)
                .map(([k, v]) => `${k}=${v}`)
                .join('&')

            const payloadBody = {
                model: <SampleModel> {
                    name: 'Valid name',
                    age: 20,
                    position: 'Coolie manager',
                },
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/custom?${queryParam}`, {
                        method: 'PATCH',
                        body: payloadBody,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(
                        'SampleModel', payloadQuery.name, payloadQuery.age, payloadQuery.position,
                        'SampleModel', payloadBody.model.name, payloadBody.model.age, payloadBody.model.position,
                    )
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should execute post-processing function', (done: Function) => {
            // Arrange
            const NUM = 20
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            let error: any
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/${NUM}/postprocess`, {
                        method: 'PATCH',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = depContainer.resolve(CONTROLLER_NAME)
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly(
                        'SampleModel', payload.name, payload.age + NUM, payload.position,
                    )
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })
    }) // describe 'translating'
}) // describe '@model() - auto'
