import TrailsApp = require('trails');
import { injectable, unmanaged, IDependencyContainer, Types as CmT } from 'back-lib-common-util';
import { Types as T } from './Types';


@injectable()
export class TrailsServerAddOn implements IServiceAddOn {

	private _server: TrailsApp;


	constructor(
		@unmanaged() depContainer: IDependencyContainer,
		@unmanaged() trailsOpts: TrailsApp.TrailsAppOts
	) {
		this._server = new TrailsApp(trailsOpts);
		depContainer.bindConstant(T.TRAILS_APP, this._server);
	}


	public get server(): TrailsApp {
		return this._server;
	}

	/**
	 * @see IServiceAddOn.init
	 */
	public init(): Promise<void> {
		return <any>this._server.start()
			.catch(err => this._server.stop(err));
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
		return <any>this._server.stop();
	}
}