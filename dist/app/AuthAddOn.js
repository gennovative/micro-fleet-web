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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const common_1 = require("@micro-fleet/common");
const ExpressServerAddOn_1 = require("./ExpressServerAddOn");
const Types_1 = require("./Types");
const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;
const { AuthSettingKeys: S } = common_1.constants;
let AuthAddOn = class AuthAddOn {
    constructor(_serverAddOn, _configProvider) {
        this._serverAddOn = _serverAddOn;
        this._configProvider = _configProvider;
        this.name = 'AuthAddOn';
    }
    //#region Init
    /**
     * @memberOf IServiceAddOn.init
     */
    init() {
        this._serverAddOn.express.use(passport.initialize());
        const opts = {
            algorithms: ['HS256'],
            secretOrKey: this._configProvider.get(S.AUTH_SECRET).value,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: this._configProvider.get(S.AUTH_ISSUER).value,
        };
        this.initToken(opts);
        return Promise.resolve();
    }
    initToken(opts) {
        // `payload` is decrypted from Access token from header.
        let strategy = new JwtStrategy(opts, (payload, done) => {
            // TODO: 1. Validate payload object
            // Optional: Log timestamp for statistics purpose
            done(null, payload);
        });
        passport.use('jwt', strategy);
    }
    //#endregion Init
    authenticate(request, response, next) {
        return new Promise((resolve, reject) => {
            passport.authenticate('jwt', (error, payload, info, status) => {
                if (error) {
                    return reject(error);
                }
                resolve({ payload, info, status });
            })(request, response, next);
        });
    }
    async createToken(payload, isRefresh) {
        const refreshExpr = this._configProvider.get(S.AUTH_EXPIRE_REFRESH).TryGetValue('30d');
        const accessExpr = this._configProvider.get(S.AUTH_EXPIRE_ACCESS).TryGetValue(60 * 30);
        const sign = new Promise((resolve, reject) => {
            jwt.sign(
            // Data
            payload, 
            // Secret
            this._configProvider.get(S.AUTH_SECRET).value, 
            // Config
            {
                expiresIn: isRefresh ? refreshExpr : accessExpr,
                issuer: this._configProvider.get(S.AUTH_ISSUER).value,
            }, 
            // Callback
            (err, token) => {
                if (token) {
                    resolve(token);
                }
                reject('Failed to create auth token');
            });
        });
        const token = await sign;
        return token;
    }
    /**
     * @memberOf IServiceAddOn.deadLetter
     */
    deadLetter() {
        return Promise.resolve();
    }
    /**
     * @memberOf IServiceAddOn.dispose
     */
    dispose() {
        return Promise.resolve();
    }
};
AuthAddOn = __decorate([
    common_1.injectable(),
    __param(0, common_1.inject(Types_1.Types.WEBSERVER_ADDON)),
    __param(1, common_1.inject(common_1.Types.CONFIG_PROVIDER)),
    __metadata("design:paramtypes", [ExpressServerAddOn_1.ExpressServerAddOn, Object])
], AuthAddOn);
exports.AuthAddOn = AuthAddOn;
//# sourceMappingURL=AuthAddOn.js.map