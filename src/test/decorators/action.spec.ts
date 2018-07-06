import * as path from 'path';
import { describe, it } from 'mocha';
import * as chai from 'chai';
import * as spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;
import * as request from 'request-promise';
import { injectable, DependencyContainer, serviceContext,
	IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common';

import { ExpressServerAddOn, AuthAddOn, Types as T } from '../../app';

// For typing only
import * as Bluebird from 'bluebird';
import { StatusCodeError } from 'request-promise/errors';
import { IncomingMessage } from 'http';

const BASE_URL = 'http://localhost';
const ALLOW_ORIGIN = 'http://allow.localhost';
const { WebSettingKeys: W } = constants;

@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
	public readonly name: string = 'MockConfigurationProvider';

	public enableRemote: boolean = false;
	public enableCors: boolean = false;

	get(key: string): Maybe<string | number | boolean | any[]> {
		switch (key) {
			case W.WEB_CORS:
				return this.enableCors ? new Maybe(ALLOW_ORIGIN) : new Maybe;
		}
		return new Maybe;
	}

	init = () => Promise.resolve();
	deadLetter = () => Promise.resolve();
	dispose = () => Promise.resolve();
	onUpdate = (listener: (changedKeys: string[]) => void) => {};
	fetch = () => Promise.resolve(true);

}

describe('@action()', function() {
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
		
	});

	afterEach(async () => {
		container.dispose();
		await server.dispose();
		container = server = null;
	});

	describe('Single HTTP verb', () => {
		it('Should automatically parse action name to create route path', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/default`;
					// Act
					return Promise.all([
						request(`${URL}/doGet`, { method: 'GET' }),
						request(`${URL}/doPost/`, { method: 'POST' }),
						request(`${URL}/doPatch`, { method: 'PATCH' }),
						request(`${URL}/doPut/`, { method: 'PUT' }),
						request(`${URL}/doDelete`, { method: 'DELETE' }),
						request(`${URL}/doHead`, { method: 'HEAD' }),
						request(`${URL}/doOptions`, { method: 'OPTIONS' }),
					]);
				})
				.then((responses: string[]) => {
					// Assert
					expect(responses.length).to.equal(7);
					expect(responses[0]).to.equal('DefaultController.doGet');
					expect(responses[1]).to.equal('DefaultController.doPost');
					expect(responses[2]).to.equal('DefaultController.doPatch');
					expect(responses[3]).to.equal('DefaultController.doPut');
					expect(responses[4]).to.equal('DefaultController.doDelete');
					expect(responses[5]['x-powered-by']).to.equal('Express');
					expect(responses[6]).to.equal('DefaultController.doOptions');
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should accept custom route path', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/custom`;
					// Act
					return Promise.all([
						request(`${URL}/get-it`, { method: 'GET' }),
						request(`${URL}/post-it/`, { method: 'POST' }),
						request(`${URL}/patch-it/`, { method: 'PATCH' }),
						request(`${URL}/put-it`, { method: 'PUT' }),
						request(`${URL}/del-it`, { method: 'DELETE' }),
						request(`${URL}/head-it`, { method: 'HEAD' }),
						request(`${URL}/opt-it`, { method: 'OPTIONS' }),
					]);
				})
				.then((responses: string[]) => {
					// Assert
					expect(responses.length).to.equal(7);
					expect(responses[0]).to.equal('CustomController.doGet');
					expect(responses[1]).to.equal('CustomController.doPost');
					expect(responses[2]).to.equal('CustomController.doPatch');
					expect(responses[3]).to.equal('CustomController.doPut');
					expect(responses[4]).to.equal('CustomController.doDelete');
					expect(responses[5]['x-powered-by']).to.equal('Express');
					expect(responses[6]).to.equal('CustomController.doOptions');
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should only expose decorated actions', (done) => {
			// Arrange
			const URL = `${BASE_URL}/default`;
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					// Act
					return request(`${URL}/doGet`, { method: 'GET' });
				})
				.then((res: string) => {
					// Assert
					expect(res).to.equal('DefaultController.doGet');
				})
				.then(() => {
					// Act
					return request(`${URL}/doSecret`, { method: 'GET' });
				})
				.then(() => {
					// Unexpectedly Assert
					expect(false, 'Should never come here!').to.be.true;
				})
				.catch(error => {
					// Assert
					if (error instanceof StatusCodeError) {
						expect(error.statusCode).to.equal(404);
					} else {
						console.error(error);
						expect(false, 'Should never throw this kind of error!').to.be.true;
					}
				})
				.finally(() => done());
		});

		it('Should disable CORS by default (allow all requests)', (done) => {
			// Arrange
			const URL = `${BASE_URL}/default`;
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					// Act
					return request(`${URL}/doGet`, { 
						method: 'OPTIONS',
						headers: {
							'Authorization': 'Bearer AbcXyz',
							'Origin': 'alien.localhost',
						},
						resolveWithFullResponse: true,
					});
				})
				.then((res: IncomingMessage) => {
					const headers = res.headers;
					// Assert
					expect(headers['access-control-allow-methods']).not.to.exist;
					expect(headers['access-control-allow-origin']).not.to.exist;
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should restrict origin with CORS', (done) => {
			// Arrange
			const config: MockConfigurationProvider = container.resolve(CmT.CONFIG_PROVIDER);
			config.enableCors = true;

			const URL = `${BASE_URL}/default`;
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					// Act
					return request(`${URL}/doGet`, { 
						method: 'OPTIONS',
						headers: {
							'Authorization': 'Bearer AbcXyz',
							'Origin': 'alien.localhost',
						},
						resolveWithFullResponse: true,
					});
				})
				.then((res: IncomingMessage) => {
					const headers = res.headers;
					// Assert
					expect(headers['access-control-allow-methods']).to.exist;
					expect(headers['access-control-allow-origin']).to.equal(ALLOW_ORIGIN);
				})
				.catch(error => {
					// Assert
					if (error instanceof StatusCodeError) {
						expect(error.statusCode).to.equal(404);
					} else {
						console.error(error);
						expect(false, 'Should never throw this kind of error!').to.be.true;
					}
				})
				.finally(() => done());
		});
	}); // END describe('Single HTTP verb')

	describe('Multiple HTTP verbs', () => {
		it('Should automatically parse action name to create route paths', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/default`;
					// Act
					return Promise.all([
						request(`${URL}/doMany`, { method: 'GET' }),
						request(`${URL}/doMany/`, { method: 'POST' }),
						request(`${URL}/doMany`, { method: 'PATCH' }),
						request(`${URL}/doMany/`, { method: 'PUT' }),
						request(`${URL}/doMany`, { method: 'DELETE' }),
						request(`${URL}/doMany`, { method: 'HEAD' }),
						request(`${URL}/doMany`, { method: 'OPTIONS' }),
					]);
				})
				.then((responses: string[]) => {
					// Assert
					expect(responses.length).to.equal(7);
					expect(responses[0]).to.equal('DefaultController.doMany');
					expect(responses[1]).to.equal('DefaultController.doMany');
					expect(responses[2]).to.equal('DefaultController.doMany');
					expect(responses[3]).to.equal('DefaultController.doMany');
					expect(responses[4]).to.equal('DefaultController.doMany');
					expect(responses[5]['x-powered-by']).to.equal('Express');
					expect(responses[6]).to.equal('DefaultController.doMany');
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should accept custom route paths', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/custom`;
					// Act
					return Promise.all([
						request(`${URL}/get-many`, { method: 'GET' }),
						request(`${URL}/post-many/`, { method: 'POST' }),
						request(`${URL}/patch-many`, { method: 'PATCH' }),
						request(`${URL}/put-many/`, { method: 'PUT' }),
						request(`${URL}/del-many`, { method: 'DELETE' }),
						request(`${URL}/head-many`, { method: 'HEAD' }),
						request(`${URL}/opt-many`, { method: 'OPTIONS' }),
					]);
				})
				.then((responses: string[]) => {
					// Assert: Call same action with multiple HTTP verbs.
					expect(responses.length).to.equal(7);
					expect(responses[0]).to.equal('CustomController.doMany');
					expect(responses[1]).to.equal('CustomController.doMany');
					expect(responses[2]).to.equal('CustomController.doMany');
					expect(responses[3]).to.equal('CustomController.doMany');
					expect(responses[4]).to.equal('CustomController.doMany');
					expect(responses[5]['x-powered-by']).to.equal('Express');
					expect(responses[6]).to.equal('CustomController.doMany');
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});
	}); // END describe('Multiple HTTP verbs')

	describe('All HTTP verbs', () => {

		const SUPPORTED_VERBS = ['checkout', 'copy', 'delete', 'get', 'lock',
			'merge', 'notify', 'options', 'patch', 'post', 'purge', 'put', 'report',
			'search', 'subscribe', 'trace', 'unlock', 'unsubscribe' ];

		it('Should automatically parse action name to create route paths', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/default`;
					// Act
					return Promise.all(SUPPORTED_VERBS.map(v => request(`${URL}/doAll`, { method: v })));
				})
				.then((responses: string[]) => {
					// Assert
					expect(responses.length).to.equal(SUPPORTED_VERBS.length);
					for (let i = 0; i < SUPPORTED_VERBS.length; i++) {
						expect(responses[i]).to.equal('DefaultController.doAll');
					}
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should accept custom route paths', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'custom-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					const URL = `${BASE_URL}/custom`;
					// Act
					return Promise.all(SUPPORTED_VERBS.map(v => request(`${URL}/do-all`, { method: v })));
				})
				.then((responses: string[]) => {
					// Assert: Call same action with multiple HTTP verbs.
					expect(responses.length).to.equal(SUPPORTED_VERBS.length);
					for (let i = 0; i < SUPPORTED_VERBS.length; i++) {
						expect(responses[i]).to.equal('CustomController.doAll');
					}
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});
	}); // END describe('All HTTP verbs')
});