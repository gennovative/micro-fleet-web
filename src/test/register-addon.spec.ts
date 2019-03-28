import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import { IDependencyContainer, DependencyContainer, serviceContext } from '@micro-fleet/common'

import { registerWebAddOn, ExpressServerAddOn, Types as T } from '../app'


describe('registerDbAddOn', function () {
    // this.timeout(60000) // For debuging

    let depCon: IDependencyContainer

    beforeEach(() => {
        depCon = new DependencyContainer()
        serviceContext.setDependencyContainer(depCon)
    })

    afterEach(() => {
        depCon.dispose()
        depCon = null
    })

    it('Should register dependencies if not already', () => {
        // Act
        registerWebAddOn()

        // Assert
        expect(depCon.isBound(T.WEBSERVER_ADDON)).to.be.true
    })

    it('Should not register dependencies if already registered', () => {
        // Arrange
        depCon.bind<ExpressServerAddOn>(T.WEBSERVER_ADDON, ExpressServerAddOn)
        chai.spy.on(depCon, 'bind')

        // Act
        registerWebAddOn()

        // Assert
        expect(depCon.bind).not.to.be.called
    })
}) // describe
