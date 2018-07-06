/// <reference types="reflect-metadata" />
import * as path from 'path';
import { describe, it } from 'mocha';
import * as chai from 'chai';
import * as spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;
import * as request from 'request-promise';
import { injectable, DependencyContainer, serviceContext, CriticalException,
	IConfigurationProvider, Maybe, Types as CmT, constants } from '@micro-fleet/common';

import { ExpressServerAddOn, AuthAddOn, Types as T, decorators } from '../../app';

// For typing only
import * as Bluebird from 'bluebird';

const BASE_URL = 'http://localhost';
const ALLOW_ORIGIN = 'http://allow.localhost';
const { WebSettingKeys: W } = constants;
const { controller } = decorators;

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


describe('@controller()', function() {
	this.timeout(5000);
	// this.timeout(60000); // For debugging
	
	describe('', () => {
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

		it('Should automatically parse controller name to create route path', (done) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'default-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					return request(`${BASE_URL}/default/doGet`, { method: 'GET' });
				})
				.then((res: string) => {
					// Assert
					expect(res).to.equal('DefaultController.doGet');
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
					// Act
					return request(`${BASE_URL}/custom/get-it`, { method: 'GET' });
				})
				.then((res: string) => {
					// Assert
					expect(res).to.equal('CustomController.doGet');
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});
	}); // END describe

	describe('', () => {
		it('Should not allow duplicate decorator', () => {
			// Arrange
			try {
				// Act
				@controller('second')
				@controller('/first/')
				class DupController {
				}

				// Unexpectedly Assert
				expect(false, `${DupController.name}'s decorator should throw error`).to.be.true;
			} catch (err) {
				// Assert
				expect(err).to.be.instanceof(CriticalException);
				expect(err.message).to.equal('Duplicate controller decorator');
			}
		});
	});
});