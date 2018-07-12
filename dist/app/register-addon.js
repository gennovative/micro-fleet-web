"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const ExpressServerAddOn_1 = require("./ExpressServerAddOn");
const Types_1 = require("./Types");
function registerWebAddOn() {
    const depCon = common_1.serviceContext.dependencyContainer;
    if (!depCon.isBound(Types_1.Types.WEBSERVER_ADDON)) {
        depCon.bind(Types_1.Types.WEBSERVER_ADDON, ExpressServerAddOn_1.ExpressServerAddOn).asSingleton();
    }
    const dbAdt = depCon.resolve(Types_1.Types.WEBSERVER_ADDON);
    return dbAdt;
}
exports.registerWebAddOn = registerWebAddOn;
//# sourceMappingURL=register-addon.js.map