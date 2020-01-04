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
const CONTROLLER_NAME = 'ParamController'
const CONTROLLER_FILE = 'param-controller'
const BASE_URL = `http://localhost:${PORT}`
const ORG_NAME = 'gennova'
const YEAR = '2050'
const SELECTED = '0'
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('@param()', function() {
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
            [W.WEB_URL_PREFIX]: '/api/:org',
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
                return request(`${BASE_URL}/api/${ORG_NAME}/param/first`, {
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
                return request(`${BASE_URL}/api/${ORG_NAME}/param/middle`, {
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
                return request(`${BASE_URL}/api/${ORG_NAME}/param/last`, {
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

    it('Should resolve multiple params', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                const url = `${BASE_URL}/api/${ORG_NAME}/param/${YEAR}/multi/${SELECTED}`
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

}) // describe '@param()'
