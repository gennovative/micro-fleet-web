/// <reference types="reflect-metadata" />
import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise'
import { injectable, DependencyContainer, serviceContext, CriticalException,
    IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, Types as T, decorators } from '../../app'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const ALLOW_ORIGIN = 'http://allow.localhost'
const { WebSettingKeys: W } = constants
const { controller } = decorators

@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
    public readonly name: string = 'MockConfigurationProvider'
    public configFilePath: string

    public enableRemote: boolean = false
    public enableCors: boolean = false

    public get(key: string): Maybe<PrimitiveType | any[]> {
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


describe('@controller()', function() {
    this.timeout(5000)
    // this.timeout(60000) // For debugging

    describe('', () => {
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

        it('Should automatically parse controller name to create route path', (done: Function) => {
            // Arrange
            let error: any
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller')
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
            server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller')
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

    describe('', () => {
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
