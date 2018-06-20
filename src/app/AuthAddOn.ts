import jwt = require('jsonwebtoken');
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { injectable, inject, Types as cmT, IConfigurationProvider } from '@micro-fleet/common';

import { ExpressServerAddOn } from './ExpressServerAddOn';
import { Types as T } from './Types';

const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;


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
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		this._serverAddOn.express.use(passport.initialize());

		const opts: passportJwt.StrategyOptions = {
			algorithms: ['HS256'],
			secretOrKey: this._configProvider.get('jwtSecret').value as string,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			issuer: this._configProvider.get('jwtIssuer').value as string,
		};
		this.initToken(opts);
		return Promise.resolve();
	}

	private initToken(opts: passportJwt.StrategyOptions): void {
		// `payload` is decrypted from Access token from header.
		let strategy = new JwtStrategy(opts, (payload, done) => {
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
		let sign = new Promise<any>((resolve, reject) => {
			jwt.sign(
				// Data
				{
					accountId: payload.id,
					username: payload.username
				},
				// Secret
				this._configProvider.get('jwtSecret').value as string,
				// Config
				{
					expiresIn: isRefresh ? '30d' : 60 * 30,
					issuer: this._configProvider.get('jwtIssuer').value as string,
				},
				// Callback
				(err, token) => {
					if (token) {
						resolve(token);
					}
				});
		});
		let token = await sign;
		return token;
	}



	/**
	 * @see IServiceAddOn.deadLetter
	 */
	public deadLetter(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * @see IServiceAddOn.dispose
	 */
	public dispose(): Promise<void> {
		return Promise.resolve();
	}
}