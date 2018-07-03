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
const AuthAddOn_1 = require("../AuthAddOn");
const lazyInject_1 = require("../decorators/lazyInject");
const Types_1 = require("../Types");
class AuthFilter {
    async execute(request, response, next) {
        try {
            const authResult = await this._authAddon.authenticate(request, response, next);
            if (!authResult) {
                return response.sendStatus(401);
            }
            else if (!authResult.payload) {
                if (authResult.info) {
                    return response.status(401).json({ message: authResult.info.message, name: authResult.info.name });
                }
                return response.sendStatus(401);
            }
            request.params['accountId'] = authResult.payload.accountId;
            request.params['username'] = authResult.payload.username;
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
    lazyInject_1.lazyInject(Types_1.Types.AUTH_ADDON),
    __metadata("design:type", AuthAddOn_1.AuthAddOn)
], AuthFilter.prototype, "_authAddon", void 0);
exports.AuthFilter = AuthFilter;
//# sourceMappingURL=AuthFilter.js.map