import { IDependencyContainer, serviceContext } from '@micro-fleet/common'

import { ExpressServerAddOn } from './ExpressServerAddOn'
import { Types as T } from './constants/Types'
import { ErrorHandlerFilter } from './filters/ErrorHandlerFilter'


export type RegisterOptions = {
    /**
     * Whether to add `ErrorHandlerFilter` to addon.
     *
     * Default is true. Turn this off if you want to add your own error handler.
     */
    useDefaultErrorHandler?: boolean
}

export function registerWebAddOn(opts: RegisterOptions = {}): ExpressServerAddOn {
    const depCon: IDependencyContainer = serviceContext.dependencyContainer
    if (!depCon.isBound(T.WEBSERVER_ADDON)) {
        depCon.bind<ExpressServerAddOn>(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton()
    }
    const dbAdt = depCon.resolve<ExpressServerAddOn>(T.WEBSERVER_ADDON)
    const defaultErr = (opts.useDefaultErrorHandler == null) ? true : opts.useDefaultErrorHandler
    defaultErr && dbAdt.addGlobalErrorHandler(ErrorHandlerFilter)
    return dbAdt
}
