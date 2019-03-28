import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise'
import { injectable, DependencyContainer, serviceContext,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, ErrorHandlerFilter,
    Types as T } from '../../app'
import { SampleModel } from '../shared/SampleModel'

// For typing only
import { StatusCodeError } from 'request-promise/errors'


const BASE_URL = 'http://localhost'
const ALLOW_ORIGIN = 'http://allow.localhost'
const { WebSettingKeys: W } = constants


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'

    public enableRemote: boolean = false
    public enableCors: boolean = false

    public get(key: string): Maybe<string | number | boolean | any[]> {
        switch (key) {
            case W.WEB_CORS:
                return this.enableCors ? new Maybe(ALLOW_ORIGIN) : new Maybe
        }
        return new Maybe
    }

    public init = () => Promise.resolve()
    public deadLetter = () => Promise.resolve()
    public dispose = () => Promise.resolve()
    public onUpdate = (listener: (changedKeys: string[]) => void) => { /* Empty */ }
    public fetch = () => Promise.resolve(true)

}


describe('@model()', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    let server: ExpressServerAddOn
    let container: DependencyContainer


    beforeEach(() => {
        container = new DependencyContainer
        serviceContext.setDependencyContainer(container)
        container.bindConstant(CmT.DEPENDENCY_CONTAINER, container)
        container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton()
        container.bind(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton()

        server = container.resolve(T.WEBSERVER_ADDON)
        server.controllerCreation = ControllerCreationStrategy.SINGLETON
    })

    afterEach(async () => {
        container.dispose()
        await server.dispose()
        container = server = null
    })

    describe('translation', () => {
        it('Should convert whole request.body.model to model class', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'model-controller')
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/valid`, {
                        method: 'POST',
                        body: { model: payload },
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = container.resolve('ModelController')
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly('SampleModel', payload.name, payload.age, payload.position)
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done())
        })

        it('Should get request payload from factory function then converting to model class', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: 'Valid name',
                age: 20,
                position: 'Coolie manager',
            }
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'model-controller')
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/custom`, {
                        method: 'POST',
                        body: payload,
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = container.resolve('ModelController')
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly('SampleModel', payload.name, payload.age, payload.position)
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done())
        })

        it('Should convert just some properties of the model class', (done: Function) => {
            // Arrange
            const payload = <Partial<SampleModel>> {
                name: 'Valid name',
                age: 20,
            }
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'model-controller')
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/partial`, {
                        method: 'POST',
                        body: { model: payload },
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = container.resolve('ModelController')
                    expect(controller['spyFn']).to.be.called.once
                    expect(controller['spyFn']).to.be.called.with.exactly('SampleModel', payload.name, payload.age, undefined)
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done())
        })
    }) // describe 'translating'

    describe('validation', () => {
        it('Should respond with 412 status code if there is validation error.', (done: Function) => {
            // Arrange
            const payload = <SampleModel> {
                name: '',
                age: 18,
            }
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'model-controller')
            server.addGlobalErrorHandler(ErrorHandlerFilter)
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/invalid`, {
                        method: 'POST',
                        body: { model: payload },
                        json: true,
                    })
                })
                .then(() => {
                    const controller: any = container.resolve('ModelController')
                    expect(controller['spyFn']).have.been.called.below(1)
                })
                .catch((error: any) => {
                    // Assert
                    if (error instanceof StatusCodeError) {
                        expect(error.statusCode).to.equal(412) // error: PRECONDITION FAILED
                    } else {
                        console.error(error)
                        expect(false, 'Should never throw this kind of error!').to.be.true
                    }
                })
                .finally(() => done())
        })
    }) // describe 'translating'

}) // describe '@model()'
