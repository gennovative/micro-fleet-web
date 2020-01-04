import * as chai from 'chai'
import * as spies from 'chai-spies'
chai.use(spies)
const expect = chai.expect
import { mock, instance } from 'ts-mockito'
import { IDependencyContainer, DependencyContainer, serviceContext,
    IConfigurationProvider, Types as cmT } from '@micro-fleet/common'

import { registerWebAddOn, ExpressServerAddOn, Types as T } from '../app'


describe('registerExpressServerAddOn', function () {
    // this.timeout(60000) // For debuging

    let depCon: IDependencyContainer

    beforeEach(() => {
        depCon = new DependencyContainer()
        serviceContext.setDependencyContainer(depCon)
        depCon.bindConstant(cmT.CONFIG_PROVIDER, instance(mock<IConfigurationProvider>()))
        depCon.bindConstant(cmT.DEPENDENCY_CONTAINER, depCon)
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
        depCon.bindConstructor<ExpressServerAddOn>(T.WEBSERVER_ADDON, ExpressServerAddOn)
        chai.spy.on(depCon, 'bindConstructor')

        // Act
        registerWebAddOn()

        // Assert
        expect(depCon.bindConstructor).not.to.be.called
    })
}) // describe
