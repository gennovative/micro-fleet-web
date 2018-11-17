import jwt = require('jsonwebtoken');
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { injectable, inject, Types as cmT, IConfigurationProvider,
	constants } from '@micro-fleet/common';

import { ExpressServerAddOn } from './ExpressServerAddOn';
import { Types as T } from './Types';

const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;
const { AuthSettingKeys: S } = constants;

export type AuthResult = {
	payload: any,
	info: any,
	status: any
};

@injectable()
export class AuthAddOn implements IServiceAddOn {

	public readonly name: string = 'AuthAddOn';

	constructor(
		@inject(T.WEBSERVER_ADDON) private _serverAddOn: ExpressServerAddOn,
		@inject(cmT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
	) {
	}


	//#region Init

	/**
	 * @memberOf IServiceAddOn.init
	 */
	public init(): Promise<void> {
		this._serverAddOn.express.use(passport.initialize());

		const opts: passportJwt.StrategyOptions = {
			algorithms: ['HS256'],
			secretOrKey: this._configProvider.get(S.AUTH_SECRET).value as string,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			issuer: this._configProvider.get(S.AUTH_ISSUER).value as string,
		};
		this.initToken(opts);
		return Promise.resolve();
	}

	private initToken(opts: passportJwt.StrategyOptions): void {
		// `payload` is decrypted from Access token from header.
		const strategy = new JwtStrategy(opts, (payload, done) => {
			// TODO: 1. Validate payload object
			// Optional: Log timestamp for statistics purpose
			done(null, payload);
		});
		passport.use('jwt', strategy);
	}

	//#endregion Init


	public authenticate(request: any, response: any, next: Function): Promise<AuthResult> {
		return new Promise<any>((resolve, reject) => {
			passport.authenticate('jwt', (error, payload, info, status) => {
				if (error) {
					return reject(error);
				}
				resolve({ payload, info, status });
			})(request, response, next);
		});
	}

	public async createToken(payload: any, isRefresh: Boolean): Promise<string> {
		const refreshExpr = this._configProvider.get(S.AUTH_EXPIRE_REFRESH).TryGetValue('30d') as number | string;
		const accessExpr = this._configProvider.get(S.AUTH_EXPIRE_ACCESS).TryGetValue(60 * 30) as number | string;
		const sign = new Promise<any>((resolve, reject) => {
			jwt.sign(
				// Data
				payload,
				// Secret
				this._configProvider.get(S.AUTH_SECRET).value as string,
				// Config
				{
					expiresIn: isRefresh ? refreshExpr : accessExpr,
					issuer: this._configProvider.get(S.AUTH_ISSUER).value as string,
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
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @memberOf IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return Promise.resolve();
	}
}