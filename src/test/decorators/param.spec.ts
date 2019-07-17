import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise'
import { injectable, DependencyContainer, serviceContext,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy,
    Types as T } from '../../app'


const PORT = 31000
const CONTROLLER_NAME = 'ParamController'
const BASE_URL = `http://localhost:${PORT}`
const ORG_NAME = 'gennova'
const DEPT_NAME = 'tech'
const EMPLOYEE_NAME = 'shazam'
const { WebSettingKeys: W } = constants


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'
    public configFilePath: string

    public enableRemote: boolean = false
    public enableCors: boolean = false

    public get(key: string): Maybe<PrimitiveType | any[]> {
        switch (key) {
            case W.WEB_URL_PREFIX:
                return Maybe.Just('/api/:org')
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


describe('@param()', function() {
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
        server.controllerPath = path.join(process.cwd(), 'dist',
            'test', 'shared', 'param-controller')
    })

    afterEach(async () => {
        container.dispose()
        await server.dispose()
        container = server = null
        serviceContext.setDependencyContainer(null)
    })

    it('Should resolve as first param', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                return request(`${BASE_URL}/api/${ORG_NAME}/param/first`, {
                    method: 'POST',
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    ORG_NAME,
                    ORG_NAME,
                    undefined,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

    it('Should resolve as middle param', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                return request(`${BASE_URL}/api/${ORG_NAME}/param/middle`, {
                    method: 'PUT',
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    ORG_NAME,
                    ORG_NAME,
                    undefined,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

    it('Should resolve as last param', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                return request(`${BASE_URL}/api/${ORG_NAME}/param/last`, {
                    method: 'PATCH',
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    ORG_NAME,
                    ORG_NAME,
                    undefined,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

    it('Should resolve multiple params', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                const url = `${BASE_URL}/api/${ORG_NAME}/param/${DEPT_NAME}/multi/${EMPLOYEE_NAME}`
                // console.log('Requesting:', url)
                return request(url)
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    ORG_NAME, ORG_NAME,
                    DEPT_NAME, DEPT_NAME,
                    EMPLOYEE_NAME, EMPLOYEE_NAME,
                    undefined,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

}) // describe '@param()'
