import * as path from 'path';
import { describe, it } from 'mocha';
import * as chai from 'chai';
import * as spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;
import * as request from 'request-promise';
// import { StatusCodeError } from 'request-promise/errors';
import { injectable, DependencyContainer, serviceContext,
	IConfigurationProvider, Maybe, Types as CmT } from '@micro-fleet/common';

import { ExpressServerAddOn, AuthAddOn, Types as T } from '../../app';

// For typing only
import * as Bluebird from 'bluebird';

const BASE_URL = 'http://localhost';


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
	public readonly name: string = 'MockConfigurationProvider';

	public enableRemote: boolean = false;

	get(key: string): Maybe<string | number | boolean | any[]> {
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
					return Promise.all([
						request(`${URL}/doGet`, { method: 'GET' }),
						request(`${URL}/doPost/`, { method: 'POST' }),
						request(`${URL}/doPatch`, { method: 'PATCH' }),
						request(`${URL}/doPut/`, { method: 'PUT' }),
						request(`${URL}/doDelete`, { method: 'DELETE' }),
					]);
				})
				.then((responses: string[]) => {
					expect(responses.length).to.equal(5);
					expect(responses[0]).to.equal('DefaultController.doGet');
					expect(responses[1]).to.equal('DefaultController.doPost');
					expect(responses[2]).to.equal('DefaultController.doPatch');
					expect(responses[3]).to.equal('DefaultController.doPut');
					expect(responses[4]).to.equal('DefaultController.doDelete');
				})
				.catch(error => {
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});
	});
});