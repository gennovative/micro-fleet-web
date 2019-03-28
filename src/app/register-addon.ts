import { IDependencyContainer, serviceContext } from '@micro-fleet/common'

import { ExpressServerAddOn } from './ExpressServerAddOn'
import { Types as T } from './Types'


export function registerWebAddOn(): ExpressServerAddOn {
    const depCon: IDependencyContainer = serviceContext.dependencyContainer
    if (!depCon.isBound(T.WEBSERVER_ADDON)) {
        depCon.bind<ExpressServerAddOn>(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton()
    }
    const dbAdt = depCon.resolve<ExpressServerAddOn>(T.WEBSERVER_ADDON)
    return dbAdt
}
