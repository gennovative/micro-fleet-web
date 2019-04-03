import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise'
import { StatusCodeError } from 'request-promise/errors'
import jwt = require('jsonwebtoken')
import { injectable, DependencyContainer, serviceContext,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, AuthAddOn, Types as T } from '../../app'

// For typing only
import * as Bluebird from 'bluebird'

type SignFunction = (payload: any, secretOrPrivateKey: jwt.Secret, options: jwt.SignOptions) => Bluebird<string>
const jwtSignAsync: SignFunction = Bluebird.promisify(jwt.sign) as any

const { AuthSettingKeys: S } =  constants

const URL = 'http://localhost',
    AUTH_SECRET = 'abcABC123',
    AUTH_ISSUER = 'localhost'


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'

    public enableRemote: boolean = false

    public get(key: string): Maybe<PrimitiveType | any[]> {
        switch (key) {
            case S.AUTH_SECRET:
                return new Maybe(AUTH_SECRET)
            case S.AUTH_ISSUER:
                return new Maybe(AUTH_ISSUER)
        }
        return new Maybe
    }

    public init = () => Promise.resolve()
    public deadLetter = () => Promise.resolve()
    public dispose = () => Promise.resolve()
    public onUpdate = (listener: (changedKeys: string[]) => void) => {/* Empty */}
    public fetch = () => Promise.resolve(true)

}

describe('@authorized()', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    let server: ExpressServerAddOn
    let container: DependencyContainer

    beforeEach(() => {
        container = new DependencyContainer
        serviceContext.setDependencyContainer(container)
        container.bindConstant(CmT.DEPENDENCY_CONTAINER, container)
        container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton()
        container.bind(T.AUTH_ADDON, AuthAddOn).asSingleton()
        container.bind(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton()

        server = container.resolve(T.WEBSERVER_ADDON)

    })

    afterEach(async () => {
        container.dispose()
        await server.dispose()
        container = server = null
    })

    describe('controller-level', () => {
        beforeEach(() => {
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'authorized-controller')
        })

        it('Should allow access if there is Authorization header', (done: Function) => {
            // Arrange
            const payload = {
                accountId: '123',
                username: 'testuser',
            }

            let authToken: string

            jwtSignAsync(payload, AUTH_SECRET,
                {
                    issuer: AUTH_ISSUER,
                })
                .then((token: string) => {
                    authToken = token
                    return server.init()
                })
                .then(() => {
                    const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn
                    return authAddon.init()
                })
                .then(() => {
                    // Act
                    return request(URL, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    })
                })
                .then((res) => {
                    expect(res).to.equal('AuthorizedController.getRestricted')
                })
                .catch(error => {
                    console.error(error)
                    expect(false, 'Should never throw this kind of error!').to.be.true
                })
                .finally(() => done())
        })

        it('Should response with 401 status code if no Authorization header', (done: Function) => {
            // Arrange
            (server.init() as any as Bluebird<void>)
            .then(() => {
                const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn
                return authAddon.init()
            })
            .then(() => {
                // Act
                return request(URL)
            })
            .then(() => {
                expect(false, 'Should never come here!').to.be.true
            })
            .catch(error => {
                if (error instanceof StatusCodeError) {
                    expect(error.statusCode).to.equal(401)
                    expect(error.message).to.include('No auth token')
                } else {
                    console.error(error)
                    expect(false, 'Should never throw this kind of error!').to.be.true
                }
            })
            .finally(() => done())
        })
    })

    describe('action-level', () => {
        beforeEach(() => {
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'authorized-action')
        })

        it('Should allow access if there is Authorization header', (done: Function) => {
            // Arrange
            const payload = {
                accountId: '123',
                username: 'testuser',
            }

            let authToken: string

            jwtSignAsync(payload, AUTH_SECRET,
                {
                    issuer: AUTH_ISSUER,
                })
                .then((token: string) => {
                    authToken = token
                    return server.init()
                })
                .then(() => {
                    const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn
                    return authAddon.init()
                })
                .then(() => {
                    // Act
                    return request(URL, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    })
                })
                .then((res) => {
                    expect(res).to.equal('AuthorizedController.getRestricted')
                })
                .catch(error => {
                    console.error(error)
                    expect(false, 'Should never throw this kind of error!').to.be.true
                })
                .finally(() => done())
        })

        it('Should response with 401 status code if no Authorization header', (done: Function) => {
            // Arrange
            (server.init() as any as Bluebird<void>)
            .then(() => {
                const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn
                return authAddon.init()
            })
            .then(() => {
                // Act
                return request(URL, {
                    method: 'DELETE',
                })
            })
            .then((res) => {
                expect(res).to.equal('AuthorizedController.deleteAtWill')
            })
            .then(() => {
                // Act
                return request(URL, {
                    method: 'GET',
                })
            })
            .then(() => {
                expect(false, 'Should never come here!').to.be.true
            })
            .catch(error => {
                if (error instanceof StatusCodeError) {
                    expect(error.statusCode).to.equal(401)
                    expect(error.message).to.include('No auth token')
                } else {
                    console.error(error)
                    expect(false, 'Should never throw this kind of error!').to.be.true
                }
            })
            .finally(() => done())
        })
    })
})
