/// <reference types="reflect-metadata" />
import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise'
import { StatusCodeError } from 'request-promise/errors'
import { injectable, DependencyContainer, serviceContext, /* CriticalException, */
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn /*, Types as T, decorators */ } from '../app'


const BASE_URL = 'http://localhost'
const BASE_URL_SSL = 'https://localhost'
// const ALLOW_ORIGIN = 'http://allow.localhost'
const { WebSettingKeys: W } = constants
// const { controller } = decorators


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'
    public configFilePath: string

    public enableRemote: boolean = false
    public enableCors: boolean = false

    constructor(private _config: object) {
        // Empty
    }

    public get(key: string): Maybe<PrimitiveType | any[]> {
        return this._config.hasOwnProperty(key) ? Maybe.Just(this._config[key]) : Maybe.Nothing()
    }

    public init = () => Promise.resolve()
    public deadLetter = () => Promise.resolve()
    public dispose = () => Promise.resolve()
    public onUpdate = (listener: (changedKeys: string[]) => void) => {/* Empty */}
    public fetch = () => Promise.resolve(true)

}


describe('ExpressServerAddOn', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    let container: DependencyContainer

    beforeEach(() => {
        container = new DependencyContainer
        serviceContext.setDependencyContainer(container)
        container.bindConstant(CmT.DEPENDENCY_CONTAINER, container)
        container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton()

    })

    afterEach(async () => {
        container.dispose()
        container = null
    })

    describe('HTTP Server', () => {
        it('Should start an HTTP server with default port 80', (done: Function) => {
            // Arrange
            const cfgProvider = new MockConfigurationProvider({
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start an HTTP server with custom port', (done: Function) => {
            // Arrange
            const HTTP_PORT = 8080
            const cfgProvider = new MockConfigurationProvider({
                [W.WEB_PORT]: HTTP_PORT,
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
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
            const cfgProvider = new MockConfigurationProvider({
                [W.WEB_SSL_ENABLED]: true,
                [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start an HTTPS server with custom port', (done: Function) => {
            // Arrange
            const HTTPS_PORT = 4433
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            const cfgProvider = new MockConfigurationProvider({
                [W.WEB_SSL_ENABLED]: true,
                [W.WEB_SSL_PORT]: HTTPS_PORT,
                [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should redirect all HTTP requests to HTTPS', (done: Function) => {
            // Arrange
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            const cfgProvider = new MockConfigurationProvider({
                [W.WEB_SSL_ENABLED]: true,
                [W.WEB_SSL_ONLY]: true,
                [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
                })
                .then(() => {
                    done()
                })
        })

        it('Should start only HTTPS server but not HTTP server', (done: Function) => {
            // Arrange
            const HTTPS_PORT = 4433
            const SSL_DIR = path.join(__dirname, 'shared', 'ssl')
            const cfgProvider = new MockConfigurationProvider({
                [W.WEB_SSL_ENABLED]: true,
                [W.WEB_SSL_ONLY]: true,
                [W.WEB_SSL_PORT]: HTTPS_PORT,
                [W.WEB_SSL_KEY_FILE]: path.join(SSL_DIR, 'key.pem'),
                [W.WEB_SSL_CERT_FILE]: path.join(SSL_DIR, 'cert.pem'),
            })
            const server = new ExpressServerAddOn(cfgProvider, container)
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
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
                    return server.dispose()
                })
                .then(() => {
                    done()
                })
        })

    }) // END describe 'SSL Server'

}) // END describe 'ExpressServerAddOn'
