/**
 * Serves as a global object for all web-related classes (controllers, policies...)
 * to use.
 */
export class WebContext {

    private _urlPrefix: string

    /**
     * Gets url prefix. Eg: /api/v1.
     */
    public get urlPrefix(): string {
        return this._urlPrefix
    }

    /**
     * Sets prefix to all route url, eg: /api/v1. Must be set before add-ons initialization phase.
     */
    public setUrlPrefix(prefix: string): void {
        if (prefix.length >= 1 && !prefix.startsWith('/')) {
            // Add heading slash
            prefix = '/' + prefix
        }
        if (prefix.endsWith('/')) {
            // Remove trailing slash
            prefix = prefix.substr(0, prefix.length - 1)
        }
        this._urlPrefix = prefix
    }
}

export const webContext = new WebContext()
