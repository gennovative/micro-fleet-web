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
let ErrorHandlerFilter = class ErrorHandlerFilter {
    constructor(
    // @inject() private logProvider: ILogProvider
    ) {
    }
    execute(error, req, res, next) {
        if (res.headersSent || !(error instanceof common_1.ValidationError)) {
            // Delegate to Express default error handler
            return next(error);
        }
        // TODO: Write error to file or logging service.
        res.status(412).send(error);
    }
};
ErrorHandlerFilter = __decorate([
    common_1.injectable(),
    __metadata("design:paramtypes", [])
], ErrorHandlerFilter);
exports.ErrorHandlerFilter = ErrorHandlerFilter;
//# sourceMappingURL=ErrorHandlerFilter.js.map