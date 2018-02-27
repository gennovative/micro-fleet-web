import TrailsApp = require('trails');
import jwt = require('jsonwebtoken');
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { Types as cmT, IConfigurationProvider } from 'back-lib-common-contracts';
import { injectable, inject } from 'back-lib-common-util';
import { TrailsServerAddOn } from './TrailsServerAddOn';
import { Types as T } from './Types';
import bluebird = require('bluebird');


const ExtractJwt = passportJwt.ExtractJwt;
const JwtStrategy = passportJwt.Strategy;

export type AuthResult = {
	payload: any,
	info: any,
	status: any
};

@injectable()
export class AuthAddOn implements IServiceAddOn {

	constructor(
		@inject(T.TRAILS_ADDON) private _serverAddOn: TrailsServerAddOn,
		@inject(cmT.CONFIG_PROVIDER) private _configProvider: IConfigurationProvider,
	) {
	}


	public get server(): TrailsApp {
		return this._serverAddOn.server;
	}


	//#region Init

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		this._serverAddOn.server['config'].web.middlewares.passportInit = passport.initialize();

		const opts = {
			algorithms: ['HS256'],
			secretOrKey: this._configProvider.get('jwtSecret'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			issuer: this._configProvider.get('jwtIssuer'),
		};
		this.initAccessToken(opts);
		return Promise.resolve();
	}

	private initAccessToken(opts): void {
		let strategy = new JwtStrategy(opts, (payload, done) => {
			done(null, payload);
		});
		passport.use('jwt-access', strategy);
	}

	private initRefreshToken(opts): void {
		let strategy = new JwtStrategy(opts, async (payload, done) => {
			done();
		});
		passport.use('jwt-refresh', strategy);
	}

	//#endregion Init

	public authenticate(request, response, next): Promise<AuthResult> {
		return new Promise<any>((resolve, reject) => {
			passport.authenticate('jwt-access', (error, payload, info, status) => {
				if (error) {
					return reject(error);
				}
				resolve({ payload, info, status });
			})(request, response, next);
		});
	}

	public async createToken(payload): Promise<string> {
		let sign = new Promise<any>((resolve, reject) => {
			jwt.sign(
				// Data
				{
					accountId: payload.id,
					username: payload.username
				},
				// Secret
				this._configProvider.get('jwtSecret'),
				// Config
				{
					expiresIn: 60 * 30,
					issuer: this._configProvider.get('jwtIssuer'),
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