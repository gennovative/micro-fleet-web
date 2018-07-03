import * as path from 'path';
import { describe, it } from 'mocha';
import * as chai from 'chai';
import * as spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;
import * as request from 'request-promise';
import { StatusCodeError } from 'request-promise/errors';
import jwt = require('jsonwebtoken');
// import * as passport from 'passport';
// import * as passportJwt from 'passport-jwt';
// const ExtractJwt = passportJwt.ExtractJwt;
// const JwtStrategy = passportJwt.Strategy;
import { injectable, DependencyContainer, serviceContext,
	IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common';

import { AuthFilter, ExpressServerAddOn, AuthAddOn, Types as T } from '../../app';

// For typing only
import * as Bluebird from 'bluebird';

type SignFunction = (payload: any, secretOrPrivateKey: jwt.Secret, options: jwt.SignOptions) => Bluebird<string>;
const jwtSignAsync: SignFunction = Bluebird.promisify(jwt.sign) as any;

const { AuthSettingKeys: S } =  constants;

const URL = 'http://localhost',
	AUTH_SECRET = 'abcABC123',
	AUTH_ISSUER = 'localhost',
	AUTH_EXPIRE = 3; // 3 secs

// @injectable()
// class MockAuthAddOn implements IServiceAddOn {
// 	public readonly name: string = 'MockAuthAddOn';

// 	public authenticate(request: any, response: any, next: Function): Promise<any> {
// 		return Promise.resolve();
// 	}

// 	init = () => Promise.resolve();
// 	deadLetter = () => Promise.resolve();
// 	dispose = () => Promise.resolve();

// }

@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
	public readonly name: string = 'MockConfigurationProvider';

	public enableRemote: boolean = false;

	get(key: string): Maybe<string | number | boolean | any[]> {
		switch (key) {
			case S.AUTH_SECRET:
				return new Maybe(AUTH_SECRET);
			case S.AUTH_ISSUER:
				return new Maybe(AUTH_ISSUER);
		}
		return new Maybe;
	}

	init = () => Promise.resolve();
	deadLetter = () => Promise.resolve();
	dispose = () => Promise.resolve();
	onUpdate = (listener: (changedKeys: string[]) => void) => {};
	fetch = () => Promise.resolve(true);

}

describe('AuthFilter', function() {
	this.timeout(5000);
	// this.timeout(60000); // For debugging

	let server: ExpressServerAddOn;
	let container: DependencyContainer;

	beforeEach(() => {
		container = new DependencyContainer;
		serviceContext.setDependencyContainer(container);
		container.bindConstant(CmT.DEPENDENCY_CONTAINER, container);
		container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton();
		container.bind(T.AUTH_ADDON, AuthAddOn).asSingleton();
		container.bind(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton();

		server = container.resolve(T.WEBSERVER_ADDON);
		server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'controllers');

	});

	afterEach(async () => {
		container.dispose();
		await server.dispose();
		container = server = null;
	});

	describe('execute', () => {
		it('Should response with 401 status code if no Authentication header', (done) => {
			// Arrange
			const spyMiddleware = chai.spy();

			server.addGlobalFilter(AuthFilter);
			(server.init() as any as Bluebird<void>)
			.then(() => {
				const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn;
				return authAddon.init();
			})
			.then(() => {
				server.express.use(spyMiddleware);
				// Act
				return request(URL);
			})
			.then(() => {
				expect(false, 'Should never come here!').to.be.true;
			})
			.catch(error => {
				if (error instanceof StatusCodeError) {
					expect(spyMiddleware).not.to.be.called;
					expect(error.statusCode).to.equal(401);
				} else {
					console.error(error);
				}
			})
			.finally(() => done());
		});

		it('Should response with 401 status code if auth token has expired', (done) => {
			// Arrange
			const spyMiddleware = chai.spy();
			const payload = {
				accountId: '123',
				username: 'testuser'
			};
			
			let authToken: string;
			
			jwtSignAsync(payload, AUTH_SECRET,
				{
					expiresIn: 3,
					issuer: AUTH_ISSUER,
				})
				.then((token: string) => {
					authToken = token;
					server.addGlobalFilter(AuthFilter);
					return server.init();
				})
				.then(() => {
					const authAddon = container.resolve(T.AUTH_ADDON) as AuthAddOn;
					return authAddon.init();
				})
				.delay(1000 * (AUTH_EXPIRE + 1))
				.then(() => {
					server.express.use(spyMiddleware);
					// Act
					return request(URL, {
						headers: {
							'Authorization': `Bearer ${authToken}`
						}
					});
				})
				.then(() => {
					expect(false, 'Should never come here!').to.be.true;
				})
				.catch(error => {
					if (error instanceof StatusCodeError) {
						expect(spyMiddleware).not.to.be.called;
						expect(error.statusCode).to.equal(401);
					} else {
						console.error(error);
					}
				})
				.finally(() => done());
		});
	});
});