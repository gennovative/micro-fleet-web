## VERSIONS

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