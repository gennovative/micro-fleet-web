"use strict";
// Handle validation errors
// Handle server internal errors
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
/**
 * Provides method to look up tenant ID from tenant slug.
 */
let AuthorizeFilter = class AuthorizeFilter {
    constructor(
    // @inject() private logProvider: ILogProvider
    ) {
    }
    execute(req, res, next) {
        if (!req.header('Authorization')) {
            return res.status(401).send();
        }
        // TODO: Decode token to get user ID
        // Look up user role based on user ID
        // Check if
        next();
    }
};
AuthorizeFilter = __decorate([
    common_1.injectable(),
    __metadata("design:paramtypes", [])
], AuthorizeFilter);
exports.AuthorizeFilter = AuthorizeFilter;
//# sourceMappingURL=AuthorizeFilter.js.map