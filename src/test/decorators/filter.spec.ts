/// <reference types="reflect-metadata" />
import * as path from 'path'

import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import * as request from 'request-promise-native'
import { DependencyContainer, serviceContext, constants } from '@micro-fleet/common'

import { ExpressServerAddOn, ControllerCreationStrategy, Types as T, createExpressMockServer } from '../../app'


const PORT = 31000
const BASE_URL = `http://localhost:${PORT}`
const CONTROLLER_FILE = 'filter-controller'
const { Web: W } = constants


function isSortedDesc(arr: number[]): boolean {
    for (let i = 0; i < arr.length; i++) {
        if (i > 0 && arr[i] > arr[i - 1]) {
            return false
        }
    }
    return true
}

// tslint:disable: no-floating-promises

describe('@filter()', function() {
    // this.timeout(5000)
    this.timeout(60000) // For debugging

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
        global['callOrder'] = []
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

    it('Should invoke same-priority filters in the order they are attached', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                return request(`${BASE_URL}/same`, { method: 'GET' })
            })
            .then(() => {
                const controller: any = depContainer.resolve('SamePriorityController')
                expect(controller['spyFn']).to.be.called.once
                expect(isSortedDesc(global['callOrder'])).to.be.true
            })
            .catch((err: any) => {
                // Unexpectedly Assert
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })

    it('Should invoke filters by priority regardless the order they are attached', (done: Function) => {
        // Arrange
        let error: any
        server.init()
            .then(() => {
                return request(`${BASE_URL}/priority`, { method: 'GET' })
            })
            .then(() => {
                const controller: any = depContainer.resolve('PrioritizedController')
                expect(controller['spyFn']).to.be.called.once
                expect(isSortedDesc(global['callOrder'])).to.be.true
            })
            .catch((err: any) => {
                // Unexpectedly Assert
                console.error(error = err)
                expect(false, 'Should never come here!').to.be.true
            })
            .finally(() => done(error))
    })
})
