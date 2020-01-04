/// <reference types="reflect-metadata" />
import * as path from 'path'

import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'
import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { StatusCodeError } from 'request-promise-native/errors'

import { ExpressServerAddOn, createExpressMockServer } from '../app'


const BASE_URL = 'http://localhost'
const BASE_URL_SSL = 'https://localhost'
// const ALLOW_ORIGIN = 'http://allow.localhost'
const { Web: W } = constants


// tslint:disable: no-floating-promises

describe('ExpressServerAddOn', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    let depContainer: DependencyContainer
    let webServer: ExpressServerAddOn

    afterEach(() => {
        depContainer.dispose()
        depContainer = null
        serviceContext.setDependencyContainer(null)
    })

    describe('HTTP Server', () => {
        it('Should start an HTTP server with default port 80', (done: Function) => {
            // Arrange
            ({ server: webServer, depContainer } = createExpressMockServer())
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL}/default/doGet`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start an HTTP server with custom port', (done: Function) => {
            // Arrange
            const HTTP_PORT = 8182
            ; ({ server: webServer, depContainer } = createExpressMockServer({
                configs: {
                    [W.WEB_PORT]: HTTP_PORT,
                },
            }))
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL}:${HTTP_PORT}/default/doGet`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })
    }) // END describe 'HTTP Server'

    describe('SSL Server', () => {
        it('Should start an HTTPS server with default port 443', (done: Function) => {
            // Arrange
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            ; ({ server: webServer, depContainer } = createExpressMockServer({
                configs: {
                    [W.WEB_SSL_ENABLED]: true,
                    [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                    [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
                },
            }))
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL_SSL}/default/doGet`, {
                        method: 'GET',
                        strictSSL: false,
                    })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start an HTTPS server with custom port', (done: Function) => {
            // Arrange
            const HTTPS_PORT = 4433
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            ; ({ server: webServer, depContainer } = createExpressMockServer({
                configs: {
                    [W.WEB_SSL_ENABLED]: true,
                    [W.WEB_SSL_PORT]: HTTPS_PORT,
                    [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                    [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
                },
            }))
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL_SSL}:${HTTPS_PORT}/default/doGet`, {
                        method: 'GET',
                        strictSSL: false,
                    })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpectedly Assert
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should redirect all HTTP requests to HTTPS', (done: Function) => {
            // Arrange
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            ; ({ server: webServer, depContainer } = createExpressMockServer({
                configs: {
                    [W.WEB_SSL_ENABLED]: true,
                    [W.WEB_SSL_ONLY]: true,
                    [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                    [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
                },
            }))
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL_SSL}/default/doGet`, {
                        method: 'GET',
                        strictSSL: false,
                    })
                })
                .then((res: string) => {
                    // Assert: HTTPS server should be working
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpected
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .then(() => {
                    return request(`${BASE_URL}/default/doGet`, {
                        method: 'GET',
                        followRedirect: false,
                    })
                })
                .then((res: string) => {
                    // Unexpected
                    console.error(res)
                    expect(false, 'Should never come here!').to.be.true
                })
                .catch((error: StatusCodeError) => {
                    // Assert: HTTP server should NOT be working
                    expect(error.statusCode).to.equal(301)
                    expect(error.response.headers.location.startsWith('https')).to.be.true
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start only HTTPS server but not HTTP server', (done: Function) => {
            // Arrange
            const HTTPS_PORT = 4433
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            ; ({ server: webServer, depContainer } = createExpressMockServer({
                configs: {
                    [W.WEB_SSL_ENABLED]: true,
                    [W.WEB_SSL_ONLY]: true,
                    [W.WEB_SSL_PORT]: HTTPS_PORT,
                    [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                    [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
                },
            }))
            serviceContext.setDependencyContainer(depContainer)

            webServer.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            webServer.cleanUpDecorators = false
            webServer.init()
                .then(() => {
                    return request(`${BASE_URL_SSL}:${HTTPS_PORT}/default/doGet`, {
                        method: 'GET',
                        strictSSL: false,
                    })
                })
                .then((res: string) => {
                    // Assert: HTTPS server should be working
                    expect(res).to.equal('DefaultController.doGet')
                })
                .catch((error: any) => {
                    // Unexpected
                    console.error(error)
                    expect(false, 'Should never come here!').to.be.true
                })
                .then(() => {
                    return request(`${BASE_URL}/default/doGet`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Unexpected
                    console.error(res)
                    expect(false, 'Should never come here!').to.be.true
                })
                .catch((error: Error) => {
                    // Assert: HTTP server should NOT be working
                    expect(error.message).to.contain('ECONNREFUSED')
                })
                .finally(() => {
                    return webServer.dispose()
                })
                .then(() => {
                    done()
                })
        })

    }) // END describe 'SSL Server'

}) // END describe 'ExpressServerAddOn'
