import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { injectable, DependencyContainer, serviceContext,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, Types as T } from '../../app'

// For typing only
import { StatusCodeError } from 'request-promise-native/errors'
import { IncomingMessage } from 'http'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const ALLOW_ORIGIN = 'http://allow.localhost'
const { WebSettingKeys: W } = constants

@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'
    public configFilePath: string

    public enableRemote: boolean = false
    public enableCors: boolean = false

    public get(key: string): Maybe<any> {
        switch (key) {
            case W.WEB_CORS:
                return this.enableCors ? Maybe.Just(ALLOW_ORIGIN) : Maybe.Nothing()
            case W.WEB_PORT:
                return Maybe.Just(PORT)
        }
        return Maybe.Nothing()
    }

    public init = () => Promise.resolve()
    public deadLetter = () => Promise.resolve()
    public dispose = () => Promise.resolve()
    public onUpdate = (listener: (changedKeys: string[]) => void) => {/* Empty */}
    public fetch = () => Promise.resolve(true)

}

describe('@action()', function() {
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

    })

    afterEach(async () => {
        container.dispose()
        await server.dispose()
        container = server = null
        serviceContext.setDependencyContainer(null)
    })

    describe('Single HTTP verb', () => {
        it('Should automatically parse action name to create route path', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/default`
                    // Act
                    return Promise.all([
                        request(`${URL}/doGet`, { method: 'GET' }),
                        request(`${URL}/doPost/`, { method: 'POST' }),
                        request(`${URL}/doPatch`, { method: 'PATCH' }),
                        request(`${URL}/doPut/`, { method: 'PUT' }),
                        request(`${URL}/doDelete`, { method: 'DELETE' }),
                        request(`${URL}/doHead`, { method: 'HEAD' }),
                        request(`${URL}/doOptions`, { method: 'OPTIONS' }),
                    ])
                })
                .then((responses: string[]) => {
                    // Assert
                    expect(responses.length).to.equal(7)
                    expect(responses[0]).to.equal('DefaultController.doGet')
                    expect(responses[1]).to.equal('DefaultController.doPost')
                    expect(responses[2]).to.equal('DefaultController.doPatch')
                    expect(responses[3]).to.equal('DefaultController.doPut')
                    expect(responses[4]).to.equal('DefaultController.doDelete')
                    expect(responses[5]['content-type']).to.exist
                    expect(responses[6]).to.equal('DefaultController.doOptions')
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
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/custom`
                    // Act
                    return Promise.all([
                        request(`${URL}/get-it`, { method: 'GET' }),
                        request(`${URL}/post-it/`, { method: 'POST' }),
                        request(`${URL}/patch-it/`, { method: 'PATCH' }),
                        request(`${URL}/put-it`, { method: 'PUT' }),
                        request(`${URL}/del-it`, { method: 'DELETE' }),
                        request(`${URL}/head-it`, { method: 'HEAD' }),
                        request(`${URL}/opt-it`, { method: 'OPTIONS' }),
                    ])
                })
                .then((responses: string[]) => {
                    // Assert
                    expect(responses.length).to.equal(7)
                    expect(responses[0]).to.equal('CustomController.doGet')
                    expect(responses[1]).to.equal('CustomController.doPost')
                    expect(responses[2]).to.equal('CustomController.doPatch')
                    expect(responses[3]).to.equal('CustomController.doPut')
                    expect(responses[4]).to.equal('CustomController.doDelete')
                    expect(responses[5]['content-type']).to.exist
                    expect(responses[6]).to.equal('CustomController.doOptions')
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should only expose decorated actions', (done: Function) => {
            // Arrange
            let error: any
            const URL = `${BASE_URL}/default`
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    // Act
                    return request(`${URL}/doGet`, { method: 'GET' })
                })
                .then((res: string) => {
                    // Assert
                    expect(res).to.equal('DefaultController.doGet')
                })
                .then(() => {
                    // Act
                    return request(`${URL}/doSecret`, { method: 'GET' })
                })
                .then(() => {
                    // Unexpectedly Assert
                    expect(false, 'Should never come here!').to.be.true
                })
                .catch((err: any) => {
                    // Assert
                    if (err instanceof StatusCodeError) {
                        expect(err.statusCode).to.equal(404)
                    } else {
                        console.error(error = err)
                        expect(false, 'Should never throw this kind of error!').to.be.true
                    }
                })
                .finally(() => done(error))
        })

        it('Should disable CORS by default (allow all requests)', (done: Function) => {
            // Arrange
            let error: any
            const URL = `${BASE_URL}/default`
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    // Act
                    return request(`${URL}/doGet`, {
                        method: 'OPTIONS',
                        headers: {
                            'Authorization': 'Bearer AbcXyz',
                            'Origin': 'alien.localhost',
                        },
                        resolveWithFullResponse: true,
                    })
                })
                .then((res: IncomingMessage) => {
                    const headers = res.headers
                    // Assert
                    expect(headers['access-control-allow-methods']).not.to.exist
                    expect(headers['access-control-allow-origin']).not.to.exist
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should restrict origin with CORS', (done: Function) => {
            // Arrange
            let error: any
            const config: MockConfigurationProvider = container.resolve(CmT.CONFIG_PROVIDER)
            config.enableCors = true

            const URL = `${BASE_URL}/default`
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    // Act
                    return request(`${URL}/doGet`, {
                        method: 'OPTIONS',
                        headers: {
                            'Authorization': 'Bearer AbcXyz',
                            'Origin': 'alien.localhost',
                        },
                        resolveWithFullResponse: true,
                    })
                })
                .then((res: IncomingMessage) => {
                    const headers = res.headers
                    // Assert
                    expect(headers['access-control-allow-methods']).to.exist
                    expect(headers['access-control-allow-origin']).to.equal(ALLOW_ORIGIN)
                })
                .catch((err: any) => {
                    // Assert
                    if (error instanceof StatusCodeError) {
                        expect(error.statusCode).to.equal(404)
                    } else {
                        console.error(error = err)
                        expect(false, 'Should never throw this kind of error!').to.be.true
                    }
                })
                .finally(() => done(error))
        })
    }) // END describe('Single HTTP verb')

    describe('Multiple HTTP verbs', () => {
        it('Should automatically parse action name to create route paths', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/default`
                    // Act
                    return Promise.all([
                        request(`${URL}/doMany`, { method: 'GET' }),
                        request(`${URL}/doMany/`, { method: 'POST' }),
                        request(`${URL}/doMany`, { method: 'PATCH' }),
                        request(`${URL}/doMany/`, { method: 'PUT' }),
                        request(`${URL}/doMany`, { method: 'DELETE' }),
                        request(`${URL}/doMany`, { method: 'HEAD' }),
                        request(`${URL}/doMany`, { method: 'OPTIONS' }),
                    ])
                })
                .then((responses: string[]) => {
                    // Assert
                    expect(responses.length).to.equal(7)
                    expect(responses[0]).to.equal('DefaultController.doMany')
                    expect(responses[1]).to.equal('DefaultController.doMany')
                    expect(responses[2]).to.equal('DefaultController.doMany')
                    expect(responses[3]).to.equal('DefaultController.doMany')
                    expect(responses[4]).to.equal('DefaultController.doMany')
                    expect(responses[5]['content-type']).to.exist
                    expect(responses[6]).to.equal('DefaultController.doMany')
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should accept custom route paths', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/custom`
                    // Act
                    return Promise.all([
                        request(`${URL}/get-many`, { method: 'GET' }),
                        request(`${URL}/post-many/`, { method: 'POST' }),
                        request(`${URL}/patch-many`, { method: 'PATCH' }),
                        request(`${URL}/put-many/`, { method: 'PUT' }),
                        request(`${URL}/del-many`, { method: 'DELETE' }),
                        request(`${URL}/head-many`, { method: 'HEAD' }),
                        request(`${URL}/opt-many`, { method: 'OPTIONS' }),
                    ])
                })
                .then((responses: string[]) => {
                    // Assert: Call same action with multiple HTTP verbs.
                    expect(responses.length).to.equal(7)
                    expect(responses[0]).to.equal('CustomController.doMany')
                    expect(responses[1]).to.equal('CustomController.doMany')
                    expect(responses[2]).to.equal('CustomController.doMany')
                    expect(responses[3]).to.equal('CustomController.doMany')
                    expect(responses[4]).to.equal('CustomController.doMany')
                    expect(responses[5]['content-type']).to.exist
                    expect(responses[6]).to.equal('CustomController.doMany')
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })
    }) // END describe('Multiple HTTP verbs')

    describe('All HTTP verbs', () => {

        const SUPPORTED_VERBS = ['checkout', 'copy', 'delete', 'get', 'lock',
            'merge', 'notify', 'options', 'patch', 'post', 'purge', 'put', 'report',
            'search', 'subscribe', 'trace', 'unlock', 'unsubscribe' ]

        it('Should automatically parse action name to create route paths', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/default`
                    // Act
                    return Promise.all(SUPPORTED_VERBS.map(v => request(`${URL}/doAll`, { method: v })))
                })
                .then((responses: string[]) => {
                    // Assert
                    expect(responses.length).to.equal(SUPPORTED_VERBS.length)
                    for (let i = 0; i < SUPPORTED_VERBS.length; i++) {
                        expect(responses[i]).to.equal('DefaultController.doAll')
                    }
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })

        it('Should accept custom route paths', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller')
            server.init()
                .then(() => {
                    const URL = `${BASE_URL}/custom`
                    // Act
                    return Promise.all(SUPPORTED_VERBS.map(v => request(`${URL}/do-all`, { method: v })))
                })
                .then((responses: string[]) => {
                    // Assert: Call same action with multiple HTTP verbs.
                    expect(responses.length).to.equal(SUPPORTED_VERBS.length)
                    for (let i = 0; i < SUPPORTED_VERBS.length; i++) {
                        expect(responses[i]).to.equal('CustomController.doAll')
                    }
                })
                .catch((err: any) => {
                    // Unexpectedly Assert
                    console.error(error = err)
                    expect(false, 'Should never come here!').to.be.true
                })
                .finally(() => done(error))
        })
    }) // END describe('All HTTP verbs')
})
