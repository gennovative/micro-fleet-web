"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Serves as a global object for all web-related classes (controllers, policies...)
 * to use.
 */
class WebContext {
    /**
     * Gets url prefix. Eg: /api/v1.
     */
    get urlPrefix() {
        return this._urlPrefix;
    }
    /**
     * Sets prefix to all route url, eg: /api/v1. Must be set before add-ons initialization phase.
     */
    setUrlPrefix(prefix) {
        if (prefix.length >= 1 && !prefix.startsWith('/')) {
            // Add heading slash
            prefix = '/' + prefix;
        }
        if (prefix.endsWith('/')) {
            // Remove trailing slash
            prefix = prefix.substr(0, prefix.length - 1);
        }
        this._urlPrefix = prefix;
    }
}
exports.WebContext = WebContext;
exports.webContext = new WebContext();
//# sourceMappingURL=WebContext.js.map