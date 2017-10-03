import { IDependencyContainer, Guard } from 'back-lib-common-util';


/**
 * Serves as a global object for all web-related classes (controllers, policies...)
 * to use.
 */
export class ServerContext {

	private _depContainer: IDependencyContainer;
	private _pathPrefix: string;

	/**
	 * Gets dependency container.
	 */
	public get dependencyContainer(): IDependencyContainer {
		return this._depContainer;
	}

	/**
	 * Gets path prefix. Eg: /api/v1.
	 */
	public get pathPrefix(): string {
		return this._pathPrefix;
	}

	public setDependencyContainer(container: IDependencyContainer): void {
		this._depContainer = container;
	}

	public setPathPrefix(prefix: string): void {
		if (!prefix.startsWith('/')) {
			prefix = '/' + prefix;
		}
		if (!prefix.endsWith('/')) {
			// Remove trailing slash
			prefix = prefix + '/';
		}
		this._pathPrefix = prefix;
	}
}

export const serverContext = new ServerContext();