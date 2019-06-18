## VERSIONS

### 1.2.0
- Converted action decorators `@model` to param decorator.
- Added parameters decorators for action methods.
- Upgraded to new version of `@micro-fleet/common` with breaking change.

### 1.1.3
- Added `RestControllerBase.noContent` which returns 204-code response.
- Removed native BigInt type, using string instead.

### 1.1.2
- Added `request.extras` property as attachment point for filters.
- [#4](https://github.com/gennovative/micro-fleet-web/issues/4) - Global ErrorHandlerFilter cannot catch async exception from action method
- [#5](https://github.com/gennovative/micro-fleet-web/issues/5) - Should allow route param in URL prefix setting
- [#7](https://github.com/gennovative/micro-fleet-web/issues/7) - `ModelFilter` attaches tenantId to result.
- [#8](https://github.com/gennovative/micro-fleet-web/issues/8) - Improved `ModelFilter` error message
- [#9](https://github.com/gennovative/micro-fleet-web/issues/9) - Cannot spy on action method when unit testing
- `ErrorHandlerFilter` only responds with server-side errors in DEBUG mode.

### 1.1.1
- Remove script "postinstall" from `package.json`.

### 1.1.0
- Upgraded dependencies.
- Improved lint rules.
- [#1](https://github.com/gennovative/micro-fleet-web/issues/1) - Supports HTTPS server.
- [#2](https://github.com/gennovative/micro-fleet-web/issues/2) - Inject dependencies to `ExpressServerAddOn` through constructor instead of lazy property.
- Moved authorization logic to [@micro-fleet/oauth](https://github.com/gennovative/micro-fleet-oauth).
- Mask `express.Request` and `express.Response` with our own `Request` and `Response` type.

### 1.0.3
- Fixed node engine version in package.json
- Refactor to replace `let` with `const`.

### 1.0.2
- Adds prop "user" to Express request instead of "auth".
- Fixed issue with auth secret.

### 1.0.1
- Return validation error details to client.
- Correctly export "decorators" group and definition files.
- Removed "x-powered-by" from Express response headers.
- Correctly load controller class.

### 1.0.0
- Added unit tests.
- Utilizes Express middleware for controller, action and filter.
- Can parse request body to model class using @model() filter

### 0.2.1
- Improved controller and action filter pre-binding process.
- Improved automatic route generation process.
- Fixed some bugs in `RestCRUDControllerBase`.
- Removed `api` property from TrailsOpts.

### 0.2.0
- Split **RestControllerBase** into **RestCRUDControllerBase** (inherits **RestControllerBase**).
- **RestControllerBase** provides basic response actions.
- **RestCRUDControllerBase** provides CRUD actions and function `CreateRouteConfigs` to generate route configs.

### 0.1.0
- **TrailsServerAddOn**: Service addon for igniting Trails server.
- **RestControllerBase**: Base controller classes that handles REST CRUD endpoints.