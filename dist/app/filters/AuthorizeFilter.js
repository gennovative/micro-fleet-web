"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
const AuthAddOn_1 = require("../AuthAddOn");
const Types_1 = require("../Types");
const ActionFilterBase_1 = require("./ActionFilterBase");
class AuthorizeFilter extends ActionFilterBase_1.ActionFilterBase {
    async execute(request, response, next) {
        try {
            const authResult = await this._authAddon.authenticate(request, response, next);
            if (!authResult.payload) {
                return response.status(401).send(authResult.info.message);
            }
            const auth = {};
            this.addReadonlyProp(auth, 'accountId', authResult.payload.accountId);
            this.addReadonlyProp(auth, 'username', authResult.payload.username);
            this.addReadonlyProp(request, 'auth', auth);
            next();
        }
        catch (err) {
            console.error(err);
            response.sendStatus(401);
            // response status 401 Unthorized
        }
    }
}
__decorate([
    common_1.lazyInject(Types_1.Types.AUTH_ADDON),
    __metadata("design:type", AuthAddOn_1.AuthAddOn)
], AuthorizeFilter.prototype, "_authAddon", void 0);
exports.AuthorizeFilter = AuthorizeFilter;
//# sourceMappingURL=AuthorizeFilter.js.map