"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const ExpressServerAddOn_1 = require("./ExpressServerAddOn");
const Types_1 = require("./constants/Types");
/**
 * Creates a mock instance of ExpressServerAddOn
 */
function createExpressMockServer(options = {}) {
    const opts = {
        configs: {},
        createDependencyContainer: () => new common_1.DependencyContainer,
        createConfigurationProvider: (configs, depContainer) => common_1.createMockConfigProvider(configs),
        ...options,
    };
    const container = opts.createDependencyContainer();
    // The user of this function must call this:
    //// serviceContext.setDependencyContainer(container)
    const configProvider = opts.createConfigurationProvider(opts.configs, container);
    const server = new ExpressServerAddOn_1.ExpressServerAddOn(configProvider, container);
    server.cleanUpDecorators = false;
    server.controllerCreation = ExpressServerAddOn_1.ControllerCreationStrategy.SINGLETON;
    container.bindConstant(common_1.Types.DEPENDENCY_CONTAINER, container);
    container.bindConstant(common_1.Types.CONFIG_PROVIDER, configProvider);
    container.bindConstant(Types_1.Types.WEBSERVER_ADDON, server);
    return {
        server,
        configProvider,
        depContainer: container,
    };
}
exports.createExpressMockServer = createExpressMockServer;
//# sourceMappingURL=mock-for-test.js.map