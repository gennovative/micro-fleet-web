/// <reference types="reflect-metadata" />
import * as path from 'path';

import * as chai from 'chai';
import * as spies from 'chai-spies';
chai.use(spies);
const expect = chai.expect;
import * as request from 'request-promise';
import { injectable, DependencyContainer, serviceContext,
	IConfigurationProvider, Maybe, Types as CmT } from '@micro-fleet/common';

import { ExpressServerAddOn, ControllerCreationStrategy, Types as T } from '../../app';

// For typing only
import * as Bluebird from 'bluebird';

const BASE_URL = 'http://localhost';


@injectable()
class MockConfigurationProvider implements IConfigurationProvider {
	public readonly name: string = 'MockConfigurationProvider';

	public enableRemote: boolean = false;
	public enableCors: boolean = false;

	get(key: string): Maybe<string | number | boolean | any[]> {
		return new Maybe;
	}

	init = () => Promise.resolve();
	deadLetter = () => Promise.resolve();
	dispose = () => Promise.resolve();
	onUpdate = (listener: (changedKeys: string[]) => void) => {};
	fetch = () => Promise.resolve(true);
}

// function isSortedAsc(arr: number[]): boolean {
// 	for (let i = 0; i < arr.length; i++) {
// 		if (i > 0 && arr[i] < arr[i - 1]) {
// 			return false;
// 		}
// 	}
// 	return true;
// }

function isSortedDesc(arr: number[]): boolean {
	for (let i = 0; i < arr.length; i++) {
		if (i > 0 && arr[i] > arr[i - 1]) {
			return false;
		}
	}
	return true;
}

describe('@filter()', function() {
	// this.timeout(5000);
	this.timeout(60000); // For debugging
	
	let server: ExpressServerAddOn;
	let container: DependencyContainer;

	beforeEach(() => {
		global['callOrder'] = [];
		container = new DependencyContainer;
		serviceContext.setDependencyContainer(container);
		container.bindConstant(CmT.DEPENDENCY_CONTAINER, container);
		container.bind(CmT.CONFIG_PROVIDER, MockConfigurationProvider).asSingleton();
		container.bind(T.WEBSERVER_ADDON, ExpressServerAddOn).asSingleton();

		server = container.resolve(T.WEBSERVER_ADDON);
		server.controllerCreation = ControllerCreationStrategy.SINGLETON;
	});

	afterEach(async () => {
		container.dispose();
		await server.dispose();
		container = server = null;
	});

	describe('', () => {
		it('Should invoke same-priority filters in the order they are attached', (done: Function) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'filter-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					return request(`${BASE_URL}/same`, { method: 'GET' });
				})
				.then(() => {
					const controller: any = container.resolve('SamePriorityController');
					expect(controller['spyFn']).to.be.called.once;
					expect(isSortedDesc(global['callOrder'])).to.be.true;
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});

		it('Should invoke filters by priority regardless the order they are attached', (done: Function) => {
			// Arrange
			server.controllerPath = path.join(process.cwd(), 'dist', 'test', 'shared', 'filter-controller');
			(server.init() as any as Bluebird<void>)
				.then(() => {
					return request(`${BASE_URL}/priority`, { method: 'GET' });
				})
				.then(() => {
					const controller: any = container.resolve('PrioritizedController');
					expect(controller['spyFn']).to.be.called.once;
					expect(isSortedDesc(global['callOrder'])).to.be.true;
				})
				.catch(error => {
					// Unexpectedly Assert
					console.error(error);
					expect(false, 'Should never come here!').to.be.true;
				})
				.finally(() => done());
		});
	});
});