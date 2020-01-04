import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy,
    createExpressMockServer} from '../../app'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const CONTROLLER_NAME = 'QueryController'
const CONTROLLER_FILE = 'query-controller'
const ORG_NAME = 'gennova'
const YEAR = '2050'
const SELECTED = '0'
const EMPLOYEE_NAME_1 = 'shazam'
const EMPLOYEE_NAME_2 = 'wonderwoman'
const EMPLOYEE_NAME_3 = 'superman'
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@query()', function() {
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
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
                const url = `${BASE_URL}/query/multi?org=${ORG_NAME}&year=${YEAR}&selected=${SELECTED}`
                // console.log('Requesting:', url)
                return request(url)
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    'string', ORG_NAME,
                    'number', YEAR,
                    'boolean', SELECTED,
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
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
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
