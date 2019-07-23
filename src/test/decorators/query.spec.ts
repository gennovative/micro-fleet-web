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
const BASE_URL = `http://localhost:${PORT}`
const CONTROLLER_NAME = 'QueryController'
const ORG_NAME = 'gennova'
const DEPT_NAME = 'tech'
const EMPLOYEE_NAME_1 = 'shazam'
const EMPLOYEE_NAME_2 = 'wonderwoman'
const EMPLOYEE_NAME_3 = 'superman'
const { WebSettingKeys: W } = constants


@injectable()
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


describe('@query()', function() {
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
            'test', 'shared', 'query-controller')
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
                return request(`${BASE_URL}/query/first?org=${ORG_NAME}`, {
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
                return request(`${BASE_URL}/query/middle?org=${ORG_NAME}`, {
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
                return request(`${BASE_URL}/query/last?org=${ORG_NAME}`, {
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

    it('Should resolve array values', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                const url = `${BASE_URL}/query/list?emp=${EMPLOYEE_NAME_1}&emp=${EMPLOYEE_NAME_2}&emp=${EMPLOYEE_NAME_3}`
                // console.log('Requesting:', url)
                return request(url)
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    EMPLOYEE_NAME_1, EMPLOYEE_NAME_1,
                    EMPLOYEE_NAME_2, EMPLOYEE_NAME_2,
                    EMPLOYEE_NAME_3, EMPLOYEE_NAME_3,
                    3,
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
                const url = `${BASE_URL}/query/multi?org=${ORG_NAME}&dept=${DEPT_NAME}&emp=${EMPLOYEE_NAME_1}`
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
                    EMPLOYEE_NAME_1, EMPLOYEE_NAME_1,
                    undefined,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

    it('Should resolve parsed values', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                const url = `${BASE_URL}/query/parse?nums=1&nums=2&nums=3&correct=true`
                // console.log('Requesting:', url)
                return request(url)
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = container.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    true,
                    true,
                    true,
                )
            })
            .catch((err: any) => {
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

}) // describe '@query()'
