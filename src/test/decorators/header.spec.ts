import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, createExpressMockServer} from '../../app'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const CONTROLLER_NAME = 'HeaderController'
const CONTROLLER_FILE = 'header-controller'
const HEADER_NAME_1 = 'AUTHORIZATION'
const HEADER_VAL_1 = 'abc123DEF456@_+-'
const HEADER_NAME_2 = 'X-Age'
const HEADER_VAL_2 = '20'
const HEADER_NAME_3 = 'X-Success'
const HEADER_VAL_3 = 'true'
const HEADER_NAME_LIST = 'x-list'
const HEADER_LIST_1 = 'item-1'
const HEADER_LIST_2 = 'item-2'
const HEADER_LIST_3 = 'item-3'
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@header()', function() {
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
                return request(`${BASE_URL}/header/first`, {
                    method: 'POST',
                    headers: {
                        [HEADER_NAME_1]: HEADER_VAL_1,
                    },
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    HEADER_VAL_1,
                    HEADER_VAL_1,
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
                return request(`${BASE_URL}/header/middle`, {
                    method: 'PUT',
                    headers: {
                        [HEADER_NAME_1]: HEADER_VAL_1,
                    },
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    HEADER_VAL_1,
                    HEADER_VAL_1,
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
                return request(`${BASE_URL}/header/last`, {
                    method: 'PATCH',
                    headers: {
                        [HEADER_NAME_1]: HEADER_VAL_1,
                    },
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    HEADER_VAL_1,
                    HEADER_VAL_1,
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
                const url = `${BASE_URL}/header/list`
                const values = [ HEADER_LIST_1, HEADER_LIST_2, HEADER_LIST_3 ].join(';')
                // console.log('Requesting:', url)
                return request(url, {
                    method: 'GET',
                    headers: {
                        [HEADER_NAME_LIST]: values,
                    },
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    HEADER_LIST_1, HEADER_LIST_1,
                    HEADER_LIST_2, HEADER_LIST_2,
                    HEADER_LIST_3, HEADER_LIST_3,
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
                return request(`${BASE_URL}/header/multi`, {
                    method: 'GET',
                    headers: {
                        [HEADER_NAME_1]: HEADER_VAL_1,
                        [HEADER_NAME_2]: HEADER_VAL_2,
                        [HEADER_NAME_3]: HEADER_VAL_3,
                    },
                })
            })
            .then(() => {
                // Unexpectedly Assert
                const controller: any = depContainer.resolve(CONTROLLER_NAME)
                expect(controller['spyFn']).to.be.called.once
                expect(controller['spyFn']).to.be.called.with.exactly(
                    'string', HEADER_VAL_1,
                    'number', HEADER_VAL_2,
                    'boolean', HEADER_VAL_3,
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
                return request(`${BASE_URL}/header/parse`, {
                    method: 'GET',
                    headers: {
                        'x-nums': [ 1, 2, 3 ].join('@'),
                        'x-correct': false,
                    },
                })
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

}) // describe '@header()'
