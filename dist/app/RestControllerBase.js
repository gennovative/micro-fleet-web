"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@micro-fleet/common");
let RestControllerBase = class RestControllerBase {
    //#region Sucessful responses
    /**
     * Responds as Accepted with status code 202 and optional data.
     * @param res Express response object.
     * @param data Data to optionally return to client.
     */
    accepted(res, data) {
        this.send(res, data, 202);
    }
    /**
     * Responds as Created with status code 201 and optional data.
     * @param res Express response object.
     * @param data Data to optionally return to client.
     */
    created(res, data) {
        this.send(res, data, 201);
    }
    /**
     * Responds as No Content with status code 204 and optional data.
     * @param res Express response object.
     * @param data Data to optionally return to client.
     */
    noContent(res, data) {
        this.send(res, data, 204);
    }
    /**
     * Responds as OK with status code 200 and optional data.
     * @param res Express response object.
     * @param data Data to optionally return to client.
     */
    ok(res, data) {
        this.send(res, data, 200);
    }
    //#endregion Sucessful responses
    //#region Client error reponses
    /**
     * Responds with error status code (default 400) and writes error to server log,
     * then returned it to client.
     * @param res Express response object.
     * @param returnErr Error to dump to server log, and returned to client.
     * @param statusCode HTTP status code. Must be 4xx. Default is 400.
     * @param shouldLogErr Whether to write error to server log (eg: Illegal attempt to read/write resource...). Default to false.
     */
    clientError(res, returnErr, statusCode = 400, shouldLogErr = false) {
        // TODO: Implement Logging library
        // shouldLogErr && super.log.error(returnErr)
        statusCode = (400 <= statusCode && statusCode <= 499) ? statusCode : 400;
        if (typeof returnErr == 'number') {
            returnErr += '';
        }
        res.status(statusCode).send(returnErr);
    }
    /**
     * Responds as Forbidden with status code 403 and optional error message.
     * @param res Express response object.
     * @param returnErr Data to optionally return to client.
     */
    forbidden(res, returnErr) {
        this.clientError(res, returnErr, 403);
    }
    /**
     * Responds as Not Found with status code 404 and optional error message.
     * @param res Express response object.
     * @param returnErr Data to optionally return to client.
     */
    notFound(res, returnErr) {
        this.clientError(res, returnErr, 404);
    }
    /**
     * Responds as Unauthorized with status code 401 and optional error message.
     * @param res Express response object.
     * @param returnErr Data to optionally return to client.
     */
    unauthorized(res, returnErr) {
        this.clientError(res, returnErr, 401);
    }
    /**
     * Responds error Precondition Failed with status code 412 and
     * then returned error to client.
     * @param res Express response object.
     * @param returnErr Error to returned to client.
     */
    validationError(res, returnErr) {
        this.clientError(res, returnErr, 412);
    }
    //#endregion Client error reponses
    //#region Server error reponses
    /**
     * Responds as Internal Error with status code 500 and
     * writes error to server log. The error is not returned to client.
     * @param res Express response object.
     * @param logErr Error to dump to server log, but not returned to client.
     */
    internalError(res, logErr) {
        // TODO: Implement Logging library
        // super.log.error(logErr)
        res.status(500).send('server.error.internal');
    }
    //#endregion Server error reponses
    /**
     * Sends response to client.
     * @param res Express response object.
     * @param data Data to return to client.
     * @param statusCode HTTP status code. Default is 200.
     */
    send(res, data, statusCode) {
        res = res.status(statusCode);
        if (typeof data == 'object') {
            return res.json(data);
        }
        else if (typeof data == 'number' || typeof data == 'bigint') {
            data += '';
        }
        return res.send(data);
    }
};
RestControllerBase = __decorate([
    common_1.decorators.injectable()
], RestControllerBase);
exports.RestControllerBase = RestControllerBase;
//# sourceMappingURL=RestControllerBase.js.map