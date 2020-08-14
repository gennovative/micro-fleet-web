/// <reference types="reflect-metadata" />
import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, CriticalException, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, Types as T, decorators, createExpressMockServer } from '../../app'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const { Web: W } = constants
const { controller } = decorators

// tslint:disable: no-floating-promises

describe('@controller()', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    describe('Route path', () => {
        let server: ExpressServerAddOn
        let depContainer: DependencyContainer

        function createServer(configs: object = {}): ExpressServerAddOn {
            ({ server, depContainer } = createExpressMockServer({ configs }))
            serviceContext.setDependencyContainer(depContainer)
            return server
        }

        function setController(controllerFile: string) {
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', controllerFile)
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

        it('Should automatically parse controller name to create route path', (done: Function) => {
            // Arrange
            let error: any
            setController('default-controller')
            server.init()
                .then(() => {
                    return request(`${BASE_URL}/default/doGet`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should accept custom route path', (done: Function) => {
            // Arrange
            let error: any
            setController('custom-controller')
            server.init()
                .then(() => {
                    // Act
                    return request(`${BASE_URL}/custom/get-it`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('CustomController.doGet')
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })
    }) // END describe

    describe('decorator', () => {
        it('Should not allow duplicate decorator', () => {
            // Arrange
            try {
                // Act
                @controller('second')
                @controller('/first/')
                class DupController {
                }

                // Unexpectedly Assert
                expect(false, `${DupController.name}'s decorator should throw error`).to.be.true
            } catch (err) {
                // Assert
                expect(err).to.be.instanceof(CriticalException)
                expect(err.message).to.equal('Duplicate controller decorator')
            }
        })
    })
})
